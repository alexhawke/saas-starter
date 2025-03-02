import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  smallint,
  integer,
  text,
  date,
  decimal,
  unique,
  primaryKey,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1.1. Organizations Table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  registrationNumber: varchar('registration_number', { length: 20 }),
  vatNumber: varchar('vat_number', { length: 20 }),
  businessType: varchar('business_type', { length: 50 }).notNull(),
  fiscalYearStartDay: smallint('fiscal_year_start_day').notNull(),
  fiscalYearStartMonth: smallint('fiscal_year_start_month').notNull(),
  defaultCurrency: varchar('default_currency', { length: 3 }).notNull().default('GBP'),
  addressLine1: varchar('address_line1', { length: 255 }),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  county: varchar('county', { length: 100 }),
  postcode: varchar('postcode', { length: 20 }),
  country: varchar('country', { length: 100 }).default('United Kingdom'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  logoUrl: varchar('logo_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isActive: boolean('is_active').default(true),
  currentFiscalYearEnd: date('current_fiscal_year_end'),
  dataRetentionPeriod: integer('data_retention_period').default(84),
});

// 1.2. Users Table (extending the existing users table)
export const accountingUsers = pgTable('accounting_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  isVerified: boolean('is_verified').default(false),
  verificationToken: varchar('verification_token', { length: 255 }),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpires: timestamp('reset_password_expires'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  isActive: boolean('is_active').default(true),
  defaultOrganizationId: uuid('default_organization_id').references(() => organizations.id, { onDelete: 'set null' }),
});

// 1.3. Organization User Roles
export const organizationUsers = pgTable('organization_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => accountingUsers.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull(),
  isPrimary: boolean('is_primary').default(false),
  invitedBy: uuid('invited_by').references(() => accountingUsers.id),
  invitationAcceptedAt: timestamp('invitation_accepted_at'),
  invitationToken: varchar('invitation_token', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    unq: unique().on(table.organizationId, table.userId),
  };
});

// 1.4. Accounting Firm to Client Relationships
export const accountingFirmClients = pgTable('accounting_firm_clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  firmOrganizationId: uuid('firm_organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  clientOrganizationId: uuid('client_organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  relationshipStatus: varchar('relationship_status', { length: 50 }).notNull(),
  managedByUserId: uuid('managed_by_user_id').references(() => accountingUsers.id),
  servicesProvided: varchar('services_provided', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    unq: unique().on(table.firmOrganizationId, table.clientOrganizationId),
  };
});

// 1.5. Permissions Tables
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
});

export const rolePermissions = pgTable('role_permissions', {
  role: varchar('role', { length: 50 }).notNull(),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.role, table.permissionId] }),
  };
});

export const userPermissions = pgTable('user_permissions', {
  organizationUserId: uuid('organization_user_id').notNull().references(() => organizationUsers.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  isGranted: boolean('is_granted').notNull().default(true),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.organizationUserId, table.permissionId] }),
  };
});

// 2.1. Account Categories Table
export const accountCategories = pgTable('account_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  balanceSheetCategory: varchar('balance_sheet_category', { length: 50 }),
  plCategory: varchar('pl_category', { length: 50 }),
  isSystemCategory: boolean('is_system_category').default(false),
  displayOrder: integer('display_order'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2.2. Accounts Table
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: uuid('category_id').notNull().references(() => accountCategories.id),
  isBankAccount: boolean('is_bank_account').default(false),
  bankAccountDetails: jsonb('bank_account_details'),
  isSystemAccount: boolean('is_system_account').default(false),
  taxCode: varchar('tax_code', { length: 20 }),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    unq: unique().on(table.organizationId, table.code),
  };
});

// 2.3. Account Templates for UK Business Types
export const accountTemplates = pgTable('account_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  businessType: varchar('business_type', { length: 50 }).notNull(),
  isSystemTemplate: boolean('is_system_template').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const templateAccounts = pgTable('template_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => accountTemplates.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: uuid('category_id').notNull().references(() => accountCategories.id),
  isBankAccount: boolean('is_bank_account').default(false),
  isSystemAccount: boolean('is_system_account').default(false),
  taxCode: varchar('tax_code', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2.4. VAT Configuration
export const vatSchemes = pgTable('vat_schemes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  schemeType: varchar('scheme_type', { length: 50 }).notNull(),
  flatRatePercentage: decimal('flat_rate_percentage', { precision: 5, scale: 2 }),
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vatRates = pgTable('vat_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  rate: decimal('rate', { precision: 5, scale: 2 }).notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  isDefault: boolean('is_default').default(false),
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vatReturnPeriods = pgTable('vat_return_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  periodType: varchar('period_type', { length: 50 }).notNull(),
  quartersStartMonth: integer('quarters_start_month'),
  nextDueDate: date('next_due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Export types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type AccountingUser = typeof accountingUsers.$inferSelect;
export type NewAccountingUser = typeof accountingUsers.$inferInsert;
export type OrganizationUser = typeof organizationUsers.$inferSelect;
export type NewOrganizationUser = typeof organizationUsers.$inferInsert;
export type AccountingFirmClient = typeof accountingFirmClients.$inferSelect;
export type NewAccountingFirmClient = typeof accountingFirmClients.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert;
export type AccountCategory = typeof accountCategories.$inferSelect;
export type NewAccountCategory = typeof accountCategories.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type AccountTemplate = typeof accountTemplates.$inferSelect;
export type NewAccountTemplate = typeof accountTemplates.$inferInsert;
export type TemplateAccount = typeof templateAccounts.$inferSelect;
export type NewTemplateAccount = typeof templateAccounts.$inferInsert;
export type VatScheme = typeof vatSchemes.$inferSelect;
export type NewVatScheme = typeof vatSchemes.$inferInsert;
export type VatRate = typeof vatRates.$inferSelect;
export type NewVatRate = typeof vatRates.$inferInsert;
export type VatReturnPeriod = typeof vatReturnPeriods.$inferSelect;
export type NewVatReturnPeriod = typeof vatReturnPeriods.$inferInsert;

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  organizationUsers: many(organizationUsers),
  clientsOf: many(accountingFirmClients, { relationName: 'firm_clients' }),
  accountantsOf: many(accountingFirmClients, { relationName: 'client_firms' }),
  accounts: many(accounts),
  vatSchemes: many(vatSchemes),
  vatRates: many(vatRates),
  vatReturnPeriods: many(vatReturnPeriods),
}));

export const accountingUsersRelations = relations(accountingUsers, ({ many, one }) => ({
  organizationUsers: many(organizationUsers),
  defaultOrganization: one(organizations, {
    fields: [accountingUsers.defaultOrganizationId],
    references: [organizations.id],
  }),
  managedClients: many(accountingFirmClients),
}));

export const organizationUsersRelations = relations(organizationUsers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [organizationUsers.organizationId],
    references: [organizations.id],
  }),
  user: one(accountingUsers, {
    fields: [organizationUsers.userId],
    references: [accountingUsers.id],
  }),
  inviter: one(accountingUsers, {
    fields: [organizationUsers.invitedBy],
    references: [accountingUsers.id],
  }),
  permissions: many(userPermissions),
}));

export const accountingFirmClientsRelations = relations(accountingFirmClients, ({ one }) => ({
  firm: one(organizations, {
    fields: [accountingFirmClients.firmOrganizationId],
    references: [organizations.id],
    relationName: 'firm_clients',
  }),
  client: one(organizations, {
    fields: [accountingFirmClients.clientOrganizationId],
    references: [organizations.id],
    relationName: 'client_firms',
  }),
  manager: one(accountingUsers, {
    fields: [accountingFirmClients.managedByUserId],
    references: [accountingUsers.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userPermissions: many(userPermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  organizationUser: one(organizationUsers, {
    fields: [userPermissions.organizationUserId],
    references: [organizationUsers.id],
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const accountCategoriesRelations = relations(accountCategories, ({ many }) => ({
  accounts: many(accounts),
  templateAccounts: many(templateAccounts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  organization: one(organizations, {
    fields: [accounts.organizationId],
    references: [organizations.id],
  }),
  category: one(accountCategories, {
    fields: [accounts.categoryId],
    references: [accountCategories.id],
  }),
}));

export const accountTemplatesRelations = relations(accountTemplates, ({ many }) => ({
  templateAccounts: many(templateAccounts),
}));

export const templateAccountsRelations = relations(templateAccounts, ({ one }) => ({
  template: one(accountTemplates, {
    fields: [templateAccounts.templateId],
    references: [accountTemplates.id],
  }),
  category: one(accountCategories, {
    fields: [templateAccounts.categoryId],
    references: [accountCategories.id],
  }),
}));

export const vatSchemesRelations = relations(vatSchemes, ({ one }) => ({
  organization: one(organizations, {
    fields: [vatSchemes.organizationId],
    references: [organizations.id],
  }),
}));

export const vatRatesRelations = relations(vatRates, ({ one }) => ({
  organization: one(organizations, {
    fields: [vatRates.organizationId],
    references: [organizations.id],
  }),
}));

export const vatReturnPeriodsRelations = relations(vatReturnPeriods, ({ one }) => ({
  organization: one(organizations, {
    fields: [vatReturnPeriods.organizationId],
    references: [organizations.id],
  }),
})); 