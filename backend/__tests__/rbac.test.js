const mongoose = require('mongoose');
const { requireRole, ROLE_HIERARCHY } = require('../middleware/rbac');
const Organization = require('../models/Organization');

describe('Organization RBAC Middleware (Issue #106)', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const orgId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration & Role Validation', () => {
    it('throws synchronously when initialized with an invalid or undeclared role', () => {
      expect(() => requireRole('superadmin')).toThrow(/Invalid role requirement/);
      expect(() => requireRole(null)).toThrow(/Invalid role requirement/);
      expect(() => requireRole(123)).toThrow(/Invalid role requirement/);
      expect(() => requireRole('constructor')).toThrow(/Invalid role requirement/);
    });

    it('exports expected role hierarchy with monotonic numeric ranks', () => {
      expect(ROLE_HIERARCHY.member).toBeLessThan(ROLE_HIERARCHY.admin);
      expect(ROLE_HIERARCHY.admin).toBeLessThan(ROLE_HIERARCHY.owner);
    });
  });

  describe('Authentication & Identity Guards', () => {
    it('rejects with 401 if req.user is absent', async () => {
      const middleware = requireRole('member');
      const req = { params: { orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Authentication required')
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects with 401 if req.user lacks userId, id, and _id', async () => {
      const middleware = requireRole('member');
      const req = { user: {}, params: { orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('successfully resolves identity when req.user contains userId from verified JWT', async () => {
      const mockOrg = {
        _id: orgId,
        members: [{ userId: new mongoose.Types.ObjectId(userId), role: 'member' }]
      };
      jest.spyOn(Organization, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockOrg)
      });

      const middleware = requireRole('member');
      const req = { user: { userId }, params: { orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(req.orgMembership.role).toBe('member');
    });
  });

  describe('Organization Context Resolution & Validation', () => {
    it('rejects with 400 if no orgId context is provided across params, query, or headers', async () => {
      const middleware = requireRole('member');
      const req = { user: { id: userId }, params: {}, query: {}, headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('Active organization context')
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects with 400 when query parameter orgId is array-valued', async () => {
      const middleware = requireRole('member');
      const req = { user: { id: userId }, query: { orgId: [orgId, 'another-id'] } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects with 400 when orgId has invalid ObjectId format', async () => {
      const middleware = requireRole('member');
      const req = { user: { id: userId }, params: { orgId: 'invalid-non-hex-id' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Invalid organization ID format.'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 404 when organization does not exist in database', async () => {
      jest.spyOn(Organization, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const middleware = requireRole('member');
      const req = { user: { id: userId }, params: { orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Membership & Permission Enforcement', () => {
    it('returns 403 when user is not a member of the organization', async () => {
      jest.spyOn(Organization, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: orgId,
          members: [{ userId: new mongoose.Types.ObjectId(), role: 'admin' }]
        })
      });

      const middleware = requireRole('member');
      const req = { user: { id: userId }, params: { orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not a member')
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('skips null or corrupted membership entries and finds matching user membership', async () => {
      const mockOrg = {
        _id: orgId,
        members: [
          null,
          undefined,
          { userId: null, role: 'admin' },
          { userId: new mongoose.Types.ObjectId(userId), role: 'admin' }
        ]
      };
      jest.spyOn(Organization, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockOrg)
      });

      const middleware = requireRole('admin');
      const req = { user: { id: userId }, params: { orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(req.orgMembership.role).toBe('admin');
    });

    it('returns 403 when user role is below required threshold (member requesting admin)', async () => {
      jest.spyOn(Organization, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: orgId,
          members: [{ userId: new mongoose.Types.ObjectId(userId), role: 'member' }]
        })
      });

      const middleware = requireRole('admin');
      const req = { user: { id: userId }, params: { orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Requires "admin" role or higher')
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('allows access and attaches org context when user satisfies role requirement', async () => {
      const mockOrg = {
        _id: orgId,
        name: 'Engineering',
        members: [{ userId: new mongoose.Types.ObjectId(userId), role: 'admin' }]
      };

      jest.spyOn(Organization, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockOrg)
      });

      const middleware = requireRole('admin');
      const req = { user: { id: userId }, params: { orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(req.organization).toBeDefined();
      expect(req.orgMembership.role).toBe('admin');
    });

    it('allows owner to access admin and member endpoints with header context', async () => {
      const mockOrg = {
        _id: orgId,
        name: 'Founders',
        members: [{ userId: new mongoose.Types.ObjectId(userId), role: 'owner' }]
      };

      jest.spyOn(Organization, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockOrg)
      });

      const middleware = requireRole('admin');
      const req = { user: { id: userId }, params: {}, query: {}, headers: { 'x-organization-id': orgId } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(req.orgMembership.role).toBe('owner');
    });
  });
});
