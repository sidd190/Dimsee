const mongoose = require('mongoose');
const Organization = require('../models/Organization');

const ROLE_HIERARCHY = {
  member: 1,
  admin: 2,
  owner: 3
};

/**
 * Route middleware that enforces a minimum role within the active organization.
 * Expects `req.user` to be populated by authMiddleware.
 * Looks for organization ID via params (`:orgId`), query (`?orgId=`), or header (`x-organization-id`).
 *
 * Usage:
 *   router.post('/settings', authMiddleware, requireRole('admin'), updateOrgSettings)
 */
function requireRole(minRole = 'member') {
  if (typeof minRole !== 'string' || !Object.prototype.hasOwnProperty.call(ROLE_HIERARCHY, minRole)) {
    throw new Error(`Invalid role requirement: "${minRole}". Must be one of: member, admin, owner.`);
  }

  return async function roleMiddleware(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required before role verification.'
        });
      }

      // Resolve user identity: prioritize token payload userId, then id / _id fallbacks
      const resolvedId = req.user.userId || req.user.id || req.user._id;
      if (!resolvedId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required before role verification.'
        });
      }
      const userId = resolvedId.toString();

      // Resolve organization ID context with route > query > header precedence
      let rawOrgId;
      if (req.params && req.params.orgId !== undefined) {
        rawOrgId = req.params.orgId;
      } else if (req.query && req.query.orgId !== undefined) {
        rawOrgId = req.query.orgId;
      } else if (req.headers && req.headers['x-organization-id'] !== undefined) {
        rawOrgId = req.headers['x-organization-id'];
      }

      // Reject missing, array-valued, or non-string query parameters
      if (!rawOrgId || typeof rawOrgId !== 'string' || Array.isArray(rawOrgId)) {
        return res.status(400).json({
          success: false,
          message: 'Active organization context (orgId) is required and must be a single string.'
        });
      }

      const orgId = rawOrgId.trim();

      // Reject malformed ObjectId strings before query
      if (!mongoose.isValidObjectId(orgId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organization ID format.'
        });
      }

      // Query organization membership
      const organization = await Organization.findById(orgId).lean();
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found.'
        });
      }

      // Safely find membership skipping any null or malformed entries
      const membership = organization.members?.find(
        m => m && m.userId && m.userId.toString() === userId
      );

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'User is not a member of this organization.'
        });
      }

      const userRoleRank = ROLE_HIERARCHY[membership.role] || 0;
      const requiredRoleRank = ROLE_HIERARCHY[minRole];

      if (userRoleRank < requiredRoleRank) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Requires "${minRole}" role or higher.`
        });
      }

      // Attach active organization and user membership details to request
      req.organization = organization;
      req.orgMembership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  requireRole,
  ROLE_HIERARCHY
};
