# The Classic Towers — Role-Based Access Control (RBAC)

## Overview

The Classic Towers application has **4 user roles** arranged in a strict hierarchy. Each role controls what a user can see in the sidebar, which routes they can access, and what actions they can perform on users, sites, and sensors.

---

## The 4 Roles

| Role | Description |
|------|-------------|
| **Admin** | Full system access. Manages everything. |
| **Organization** | Manages their own organization's teams and towers. |
| **Team Lead** | Manages operators under them and views sensors. |
| **Operator** | Read-only access. Views dashboard and sites only. |

### Hierarchy

```
Admin
  └── Organization
        └── Team Lead
              └── Operator
```

Each role can only manage users **below** their own level.

---

## Sidebar Navigation by Role

| Page | Admin | Organization | Team Lead | Operator |
|------|-------|--------------|-----------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Sites (view only) | — | — | — | ✅ |
| Sites (create + edit) | ✅ | ✅ (create only, no edit) | — | — |
| Sensors / Limits | ✅ Full (create, edit, view) | — | ✅ View only | — |
| Users | ✅ | ✅ | ✅ | — |
| Settings | ✅ | ✅ | — | — |

---

## Routes Access by Role

| Route | Admin | Organization | Team Lead | Operator |
|-------|-------|--------------|-----------|----------|
| `/` (Dashboard) | ✅ | ✅ | ✅ | ✅ |
| `/settings` | ✅ | ✅ | — | — |
| `/sites` | ✅ | ✅ | — | ✅ |
| `/sites/create` | ✅ | ✅ | — | — |
| `/sites/edit/:id` | ✅ | — | — | — |
| `/sites/show/:id` | ✅ | ✅ | — | — |
| `/limits` | ✅ | — | ✅ | — |
| `/limits/create` | ✅ | — | — | — |
| `/limits/edit/:id` | ✅ | — | — | — |
| `/limits/show/:id` | ✅ | — | ✅ | — |
| `/users` | ✅ | ✅ | ✅ | — |
| `/users/create` | ✅ | ✅ | ✅ | — |
| `/users/edit/:id` | ✅ | ✅ | ✅ | — |
| `/users/show/:id` | ✅ | ✅ | ✅ | — |

---

## User Management Permissions

### Who Can Create Which Users

Each role can only create users **below** their own level:

| Logged-in Role | Can Create |
|---------------|------------|
| **Admin** | Organization, Team Lead, Operator |
| **Organization** | Team Lead, Operator |
| **Team Lead** | Operator only |
| **Operator** | Nobody (no access to Users section) |

### Who Can Edit Which Users

| Logged-in Role | Can Edit |
|---------------|----------|
| **Admin** | Admin, Organization, Team Lead, Operator (everyone) |
| **Organization** | Team Lead, Operator |
| **Team Lead** | Operator only |
| **Operator** | Nobody |

### Who Can Manage (Delete/Edit) Users in the List Table

| Logged-in Role | Actions Column Visible |
|---------------|------------------------|
| **Admin** | ✅ |
| **Organization** | ✅ |
| **Team Lead** | ✅ |
| **Operator** | — (hidden) |

---

## Creating a User — Form Fields by Role

### When Creating an Organization (Admin only)
- Full Name
- Email
- Team Lead Limit (max team leads this org can have)
- Operator Limit (max operators this org can have)
- Tower Add Limit (max towers this org can add)
- Default Map Opening Location (Latitude, Longitude, Zoom)
- Password + Confirm Password

### When Creating a Team Lead
- Full Name
- Email
- Organization (dropdown — Admin must select; Organization uses own ID automatically)
- Allowed Towers for this Team Lead (Tower limit assigned to them)
- Password + Confirm Password

### When Creating an Operator
- Full Name
- Email
- Organization (dropdown — Admin must select; Organization uses own ID)
- Team Lead (dropdown — Admin/Organization must select; Team Lead uses own ID)
- Tower Details (only if Team Lead is creating):
  - Tower Location
  - Tower Type
  - Tower Picture URL
  - Tower Details (description)
- Password + Confirm Password

---

## Editing a User — Available Fields

| Field | Editable By |
|-------|-------------|
| Full Name | Any role with edit permission |
| Email | Any role with edit permission |
| Role | Only roles that can manage the target user |
| Profile Picture | Any role with edit permission |
| Is Email Verified (toggle) | Any role with edit permission |
| Is Approved (toggle) | Any role with edit permission |
| Tower Add Limit | Visible only when editing an Organization user |
| Allowed Towers | Visible only when editing a Team Lead |
| Assign Site | Visible only when editing a Team Lead |

---

## Sensors / Limits Access

| Action | Admin | Organization | Team Lead | Operator |
|--------|-------|--------------|-----------|----------|
| View Sensors List | ✅ | — | ✅ | — |
| View Sensor Detail | ✅ | — | ✅ | — |
| Create Sensor | ✅ | — | — | — |
| Edit Sensor | ✅ | — | — | — |

> Only **Admin** can create and edit sensors. **Team Lead** can only view them.

---

## Settings Access

| Role | Can Access Settings |
|------|---------------------|
| Admin | ✅ |
| Organization | ✅ |
| Team Lead | — |
| Operator | — |

---

## Authentication Pages

These pages are accessible to **unauthenticated users only**. If already logged in, users are redirected to the dashboard.

| Page | Route |
|------|-------|
| Login | `/login` |
| Forgot Password | `/forgot-password` |
| Verify OTP | `/verify-otp` |
| Update Password | `/update-password` |

> **Note:** Registration is disabled. Only existing users with permission can add new users from within the dashboard.

---

## Password Policy (on User Create)

Passwords must meet all of the following requirements:

- **Length:** 8 to 18 characters
- **Letters:** At least 2 letters (A–Z or a–z)
- **Numbers:** At least 2 digits (0–9)
- **Special Characters:** At least 2 special characters (e.g. `@`, `#`, `!`, `&`, `$`, etc.)
- **No spaces** allowed

---

## User List Table Columns

| Column | Shown For |
|--------|-----------|
| User ID | All visible users |
| Email | All visible users |
| Role | All visible users |
| Tower Limit | Only for Organization users |
| Lead Towers | Only for Team Lead users |
| Approved (Yes/No) | All visible users |
| Actions (Edit/Show/Delete) | Admin, Organization, Team Lead |

---

## Summary Quick Reference

```
ADMIN
  ✅ Full access to everything
  ✅ Can create/edit all roles
  ✅ Can manage sites, sensors, users, settings

ORGANIZATION
  ✅ Dashboard, Sites (create), Users, Settings
  ✅ Can create/edit Team Leads and Operators
  ❌ Cannot access Sensors

TEAM LEAD
  ✅ Dashboard, Users (limited), Sensors (view only)
  ✅ Can create/edit Operators only
  ❌ Cannot access Sites, Settings

OPERATOR
  ✅ Dashboard, Sites (view only)
  ❌ Cannot create/edit anything
  ❌ No Users, Sensors, or Settings access
```
