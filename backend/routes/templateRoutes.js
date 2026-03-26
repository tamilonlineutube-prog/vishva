const express = require('express');
const axios = require('axios');
const Template = require('../models/Template');

const router = express.Router();

const META_API_VERSION = 'v22.0';
const META_GRAPH_API = 'https://graph.facebook.com';

// Get Meta credentials from environment
const getMetaCredentials = () => ({
  businessAccountId: process.env.BUSINESS_ACCOUNT_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
});

/**
 * GET /api/templates
 * Get all templates
 */
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error('[Template] Error fetching templates:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/templates
 * Create a new template locally (doesn't submit to Meta yet)
 */
router.post('/', async (req, res) => {
  try {
    const { name, category, body } = req.body;

    if (!name || !category || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, body',
      });
    }

    // Check if template name already exists
    const existing = await Template.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Template with this name already exists',
      });
    }

    const template = new Template({
      name,
      category: category.toUpperCase(),
      body,
      status: 'PENDING_REVIEW',
      submittedToMeta: false,
    });

    await template.save();

    console.log(`[Template] Created locally: ${name}`);
    res.status(201).json({
      success: true,
      message: 'Template created. Use "Submit to Meta" to send for approval.',
      template,
    });
  } catch (error) {
    console.error('[Template] Error creating template:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/templates/:id/submit-to-meta
 * Submit template to Meta for approval
 */
router.post('/:id/submit-to-meta', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const { businessAccountId, accessToken } = getMetaCredentials();

    if (!businessAccountId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Meta credentials not configured. Set BUSINESS_ACCOUNT_ID and WHATSAPP_ACCESS_TOKEN',
      });
    }

    console.log(`[Template] Submitting to Meta: ${template.name}`);

    // Format category for Meta API
    const metaCategory = template.category.toUpperCase();

    // Make request to Meta API to create template
    const response = await axios.post(
      `${META_GRAPH_API}/${META_API_VERSION}/${businessAccountId}/message_templates`,
      {
        name: template.name,
        category: metaCategory,
        body: template.body,
        allow_category_change: true,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[Template] Meta response:`, response.data);

    // Update template with Meta response
    template.metaTemplateId = response.data.id;
    template.submittedToMeta = true;
    template.submittedAt = new Date();
    template.metaStatus = 'PENDING_INITIAL_REVIEW';
    template.status = 'PENDING_REVIEW';

    await template.save();

    res.json({
      success: true,
      message: 'Template submitted to Meta. Status will update once Meta reviews it.',
      template,
      metaResponse: response.data,
    });
  } catch (error) {
    console.error('[Template] Error submitting to Meta:', error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.error?.message || error.message;

    res.status(error.response?.status || 500).json({
      success: false,
      message: `Failed to submit to Meta: ${errorMessage}`,
      error: error.response?.data?.error,
    });
  }
});

/**
 * POST /api/templates/:id/check-status
 * Check template approval status from Meta
 */
router.post('/:id/check-status', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (!template.submittedToMeta || !template.metaTemplateId) {
      return res.status(400).json({
        success: false,
        message: 'Template has not been submitted to Meta yet',
      });
    }

    const { accessToken } = getMetaCredentials();

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Meta credentials not configured',
      });
    }

    console.log(`[Template] Checking status for: ${template.name}`);

    // Get template status from Meta API
    const response = await axios.get(
      `${META_GRAPH_API}/${META_API_VERSION}/${template.metaTemplateId}`,
      {
        params: {
          fields: 'id,name,status,quality_score,category,language,created_timestamp,translations',
          access_token: accessToken,
        },
      }
    );

    const metaData = response.data;

    console.log(`[Template] Meta status response:`, metaData);

    // Update template with current Meta status
    template.metaStatus = metaData.status || template.metaStatus;
    template.status = metaData.status === 'APPROVED' ? 'APPROVED' : 'PENDING_REVIEW';
    template.lastStatusCheck = new Date();

    // Store rejection reason if rejected
    if (metaData.status === 'REJECTED' && metaData.rejection_reason) {
      template.rejectionReason = metaData.rejection_reason;
    }

    await template.save();

    res.json({
      success: true,
      message: `Template status: ${metaData.status}`,
      template,
      metaData,
    });
  } catch (error) {
    console.error('[Template] Error checking status:', error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      message: `Failed to check template status: ${error.message}`,
      error: error.response?.data?.error,
    });
  }
});

/**
 * PUT /api/templates/:id
 * Update template (only if not submitted to Meta yet)
 */
router.put('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    if (template.submittedToMeta) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit templates that have been submitted to Meta',
      });
    }

    const { name, category, body } = req.body;

    if (name && name !== template.name) {
      const existing = await Template.findOne({ name });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Template with this name already exists',
        });
      }
      template.name = name;
    }

    if (category) template.category = category.toUpperCase();
    if (body) template.body = body;

    await template.save();

    res.json({
      success: true,
      message: 'Template updated',
      template,
    });
  } catch (error) {
    console.error('[Template] Error updating template:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/templates/:id
 * Delete template
 */
router.delete('/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    console.log(`[Template] Deleted: ${template.name}`);

    res.json({
      success: true,
      message: 'Template deleted',
      template,
    });
  } catch (error) {
    console.error('[Template] Error deleting template:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/templates/batch/check-all-status
 * Check status of all submitted templates
 */
router.post('/batch/check-all-status', async (req, res) => {
  try {
    const templates = await Template.find({ submittedToMeta: true });

    if (templates.length === 0) {
      return res.json({
        success: true,
        message: 'No templates submitted to Meta',
        updated: 0,
      });
    }

    const { accessToken } = getMetaCredentials();

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Meta credentials not configured',
      });
    }

    console.log(`[Template] Batch checking status for ${templates.length} templates`);

    let updated = 0;

    for (const template of templates) {
      try {
        const response = await axios.get(
          `${META_GRAPH_API}/${META_API_VERSION}/${template.metaTemplateId}`,
          {
            params: {
              fields: 'id,name,status,rejection_reason',
              access_token: accessToken,
            },
          }
        );

        const oldStatus = template.metaStatus;
        template.metaStatus = response.data.status;
        template.status = response.data.status === 'APPROVED' ? 'APPROVED' : 'PENDING_REVIEW';
        template.lastStatusCheck = new Date();

        if (response.data.rejection_reason) {
          template.rejectionReason = response.data.rejection_reason;
        }

        await template.save();

        if (oldStatus !== response.data.status) {
          console.log(`[Template] Status updated: ${template.name} - ${oldStatus} → ${response.data.status}`);
          updated++;
        }
      } catch (err) {
        console.error(`[Template] Error checking ${template.name}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Checked ${templates.length} templates, ${updated} status changes`,
      updated,
      templates: await Template.find({ submittedToMeta: true }),
    });
  } catch (error) {
    console.error('[Template] Error in batch check:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/templates/meta/fetch-all
 * Fetch all templates from Meta Business Account
 */
router.get('/meta/fetch-all', async (req, res) => {
  try {
    const { businessAccountId, accessToken } = getMetaCredentials();

    if (!businessAccountId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Meta credentials not configured',
      });
    }

    console.log('[Template] Fetching all templates from Meta...');

    const response = await axios.get(
      `${META_GRAPH_API}/${META_API_VERSION}/${businessAccountId}/message_templates`,
      {
        params: {
          fields: 'id,name,status,category,language,created_timestamp',
          access_token: accessToken,
        },
      }
    );

    const metaTemplates = response.data.data || [];
    console.log(`[Template] Found ${metaTemplates.length} templates on Meta`);

    // Check which ones are already in our database
    const imported = [];
    const skipped = [];

    for (const metaTemplate of metaTemplates) {
      const existing = await Template.findOne({ metaTemplateId: metaTemplate.id });

      if (existing) {
        skipped.push({
          name: metaTemplate.name,
          status: metaTemplate.status,
          reason: 'Already imported',
        });
      } else {
        // Import this template
        const newTemplate = new Template({
          name: metaTemplate.name,
          metaTemplateId: metaTemplate.id,
          category: metaTemplate.category || 'MARKETING',
          body: '(Imported from Meta - edit to view full content)',
          status: metaTemplate.status === 'APPROVED' ? 'APPROVED' : 'PENDING_REVIEW',
          metaStatus: metaTemplate.status,
          submittedToMeta: true,
          submittedAt: new Date(metaTemplate.created_timestamp * 1000),
          lastStatusCheck: new Date(),
        });

        await newTemplate.save();
        imported.push({
          _id: newTemplate._id,
          name: newTemplate.name,
          status: newTemplate.status,
        });
      }
    }

    res.json({
      success: true,
      message: `Imported ${imported.length} new templates from Meta, ${skipped.length} already exist`,
      imported,
      skipped,
      templates: await Template.find(),
    });
  } catch (error) {
    console.error('[Template] Error fetching from Meta:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: `Failed to fetch templates from Meta: ${error.message}`,
      error: error.response?.data?.error,
    });
  }
});

module.exports = router;
