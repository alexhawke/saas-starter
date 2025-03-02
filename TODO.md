
SQL

[ ] **1. Multi-Tenant Database Schema**

    [ ] **1.1. Organizations Table**
        [ ] Execute the following SQL:
            ```sql
            CREATE TABLE organizations (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(255) NOT NULL,
              registration_number VARCHAR(20),
              vat_number VARCHAR(20),
              business_type VARCHAR(50) NOT NULL,
              fiscal_year_start_day SMALLINT NOT NULL,
              fiscal_year_start_month SMALLINT NOT NULL,
              default_currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
              address_line1 VARCHAR(255),
              address_line2 VARCHAR(255),
              city VARCHAR(100),
              county VARCHAR(100),
              postcode VARCHAR(20),
              country VARCHAR(100) DEFAULT 'United Kingdom',
              phone VARCHAR(50),
              email VARCHAR(255),
              website VARCHAR(255),
              logo_url VARCHAR(500),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              is_active BOOLEAN DEFAULT TRUE,
              current_fiscal_year_end DATE,
              data_retention_period INTEGER DEFAULT 84
            );
            -- Add indexes (example)
            CREATE INDEX idx_organizations_name ON organizations (name);
            CREATE INDEX idx_organizations_created_at ON organizations (created_at);
            ```
        [ ] Verify the table and indexes were created successfully.
        [ ] Test data insertion and retrieval.

    [ ] **1.2. Users Table**
        [ ] Execute the following SQL:
            ```sql
            CREATE TABLE users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              email VARCHAR(255) NOT NULL UNIQUE,
              password_hash VARCHAR(255) NOT NULL,
              first_name VARCHAR(100) NOT NULL,
              last_name VARCHAR(100) NOT NULL,
              phone VARCHAR(50),
              is_verified BOOLEAN DEFAULT FALSE,
              verification_token VARCHAR(255),
              reset_password_token VARCHAR(255),
              reset_password_expires TIMESTAMP WITH TIME ZONE,
              two_factor_enabled BOOLEAN DEFAULT FALSE,
              two_factor_secret VARCHAR(255),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              last_login_at TIMESTAMP WITH TIME ZONE,
              is_active BOOLEAN DEFAULT TRUE,
              default_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL
            );
            -- Add indexes (example)
            CREATE INDEX idx_users_email ON users (email);
            ```
        [ ] Verify the table and indexes were created successfully.
        [ ] **Important:** Implement password hashing logic in the application code (e.g., using bcrypt). *Never* store plain text passwords.

    [ ] **1.3. Organization User Roles**
        [ ] Execute the following SQL:
            ```sql
            CREATE TABLE organization_users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              role VARCHAR(50) NOT NULL,
              is_primary BOOLEAN DEFAULT FALSE,
              invited_by UUID REFERENCES users(id),
              invitation_accepted_at TIMESTAMP WITH TIME ZONE,
              invitation_token VARCHAR(255),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE (organization_id, user_id)
            );
            ```
        [ ] Verify the table and constraints were created successfully.

    [ ] **1.4. Accounting Firm to Client Relationships**
        [ ] Execute the following SQL:
            ```sql
            CREATE TABLE accounting_firm_clients (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              firm_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              client_organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              relationship_status VARCHAR(50) NOT NULL,
              managed_by_user_id UUID REFERENCES users(id),
              services_provided VARCHAR(500),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE (firm_organization_id, client_organization_id)
            );
            ```
        [ ] Verify the table and constraints were created successfully.

    [ ] **1.5. Permissions Table**
        [ ] Execute the following SQL:
            ```sql
            CREATE TABLE permissions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(100) NOT NULL UNIQUE,
              description TEXT,
              category VARCHAR(100) NOT NULL
            );

            CREATE TABLE role_permissions (
              role VARCHAR(50) NOT NULL,
              permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
              PRIMARY KEY (role, permission_id)
            );

            CREATE TABLE user_permissions (
              organization_user_id UUID NOT NULL REFERENCES organization_users(id) ON DELETE CASCADE,
              permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
              is_granted BOOLEAN NOT NULL DEFAULT TRUE,
              PRIMARY KEY (organization_user_id, permission_id)
            );
            ```
         [ ] Verify the tables and constraints are created

[ ] **2. Chart of Accounts & Financial Structure**
    ...(Repeat the above pattern for sections 2 through 7, including the full SQL for each table)*

    [ ] **2.1. Account Categories Table**
        [ ] Execute the following SQL:
           ```sql
           CREATE TABLE account_categories (
             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
             name VARCHAR(100) NOT NULL,
             type VARCHAR(50) NOT NULL,
             balance_sheet_category VARCHAR(50),
             pl_category VARCHAR(50),
             is_system_category BOOLEAN DEFAULT FALSE,
             display_order INTEGER,
             created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
             updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
           );
           ```
        [ ] Verify Table Created

    [ ] **2.2. Accounts Table**
        [ ] Execute the following SQL:
          ```sql
          CREATE TABLE accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            code VARCHAR(20) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category_id UUID NOT NULL REFERENCES account_categories(id),
            is_bank_account BOOLEAN DEFAULT FALSE,
            bank_account_details JSONB,
            is_system_account BOOLEAN DEFAULT FALSE,
            tax_code VARCHAR(20),
            is_archived BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE (organization_id, code)
           );
          ```
    [ ] Verify Table Created

    [ ] **2.3. Account Templates for UK Business Types**
        [ ] Execute the following SQL:
          ```sql
            CREATE TABLE account_templates (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(255) NOT NULL,
              business_type VARCHAR(50) NOT NULL,
              is_system_template BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE template_accounts (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              template_id UUID NOT NULL REFERENCES account_templates(id) ON DELETE CASCADE,
              code VARCHAR(20) NOT NULL,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              category_id UUID NOT NULL REFERENCES account_categories(id),
              is_bank_account BOOLEAN DEFAULT FALSE,
              is_system_account BOOLEAN DEFAULT FALSE,
              tax_code VARCHAR(20),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          ```
        [ ] Verify Tables Created

    [ ] **2.4. VAT Configuration**
        [ ] Execute the following SQL:
          ```sql
            CREATE TABLE vat_schemes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              scheme_type VARCHAR(50) NOT NULL,
              flat_rate_percentage DECIMAL(5,2),
              effective_from DATE NOT NULL,
              effective_to DATE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE vat_rates (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              name VARCHAR(100) NOT NULL,
              rate DECIMAL(5,2) NOT NULL,
              code VARCHAR(20) NOT NULL,
              is_default BOOLEAN DEFAULT FALSE,
              effective_from DATE NOT NULL,
              effective_to DATE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE vat_return_periods (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              period_type VARCHAR(50) NOT NULL,
              quarters_start_month INTEGER,
              next_due_date DATE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          ```
        [ ] Verify Tables Created
[ ] **3. Transactions & Banking Core**

    [ ] **3.1. Bank Accounts**
        [ ] Execute the following SQL:
          ```sql
            CREATE TABLE bank_accounts (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
              name VARCHAR(255) NOT NULL,
              account_number VARCHAR(50),
              sort_code VARCHAR(20),
              iban VARCHAR(50),
              swift_bic VARCHAR(20),
              currency VARCHAR(3) DEFAULT 'GBP',
              current_balance DECIMAL(15,2) DEFAULT 0,
              last_reconciled_at TIMESTAMP WITH TIME ZONE,
              is_active BOOLEAN DEFAULT TRUE,
              open_banking_consent_id VARCHAR(255),
              open_banking_status VARCHAR(50) DEFAULT 'disconnected',
              open_banking_last_sync TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          ```
        [ ] Verify Table Created
    [ ] **3.2. Bank Transactions**
        [ ] Execute the following SQL:
          ```sql
          CREATE TABLE bank_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            description TEXT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            running_balance DECIMAL(15,2),
            transaction_type VARCHAR(50),
            reference VARCHAR(255),
            counterparty VARCHAR(255),
            is_reconciled BOOLEAN DEFAULT FALSE,
            is_transfer BOOLEAN DEFAULT FALSE,
            has_attachments BOOLEAN DEFAULT FALSE,
            needs_review BOOLEAN DEFAULT FALSE,
            import_id VARCHAR(255),
            import_hash VARCHAR(255),
            source VARCHAR(50) NOT NULL,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES users(id),
            updated_by UUID REFERENCES users(id)
          );
          ```
          [ ] Verify Table Created
    [ ] **3.3. Transactions (Double-Entry)**
        [ ] Execute the following SQL:
          ```sql
            CREATE TABLE transactions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE SET NULL,
              transaction_date DATE NOT NULL,
              posting_date DATE NOT NULL,
              reference VARCHAR(255),
              description TEXT,
              transaction_type VARCHAR(50) NOT NULL,
              status VARCHAR(50) NOT NULL,
              total_amount DECIMAL(15,2) NOT NULL,
              currency VARCHAR(3) DEFAULT 'GBP',
              exchange_rate DECIMAL(15,6) DEFAULT 1,
              contact_id UUID,
              contact_type VARCHAR(50),
              tax_inclusive BOOLEAN DEFAULT TRUE,
              needs_review BOOLEAN DEFAULT FALSE,
              notes TEXT,
              has_attachments BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              created_by UUID REFERENCES users(id),
              updated_by UUID REFERENCES users(id)
            );
          ```
        [ ] Verify Table Created
    [ ] **3.4. Transaction Lines**
        [ ] Execute the following SQL:
          ```sql
          CREATE TABLE transaction_lines (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
            account_id UUID NOT NULL REFERENCES accounts(id),
            description TEXT,
            amount DECIMAL(15,2) NOT NULL,
            debit_credit VARCHAR(1) NOT NULL,
            tax_amount DECIMAL(15,2) DEFAULT 0,
            tax_rate_id UUID REFERENCES vat_rates(id),
            quantity DECIMAL(15,2) DEFAULT 1,
            unit_price DECIMAL(15,2),
            discount_percentage DECIMAL(5,2) DEFAULT 0,
            discount_amount DECIMAL(15,2) DEFAULT 0,
            tracking_category_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          ```
        [ ] Verify Table Created

    [ ] **3.5. Reconciliation**
        [ ] Execute the following SQL:
          ```sql
            CREATE TABLE reconciliations (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
              start_date DATE NOT NULL,
              end_date DATE NOT NULL,
              start_balance DECIMAL(15,2) NOT NULL,
              end_balance DECIMAL(15,2) NOT NULL,
              is_complete BOOLEAN DEFAULT FALSE,
              completed_at TIMESTAMP WITH TIME ZONE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              created_by UUID REFERENCES users(id),
              completed_by UUID REFERENCES users(id)
            );

            CREATE TABLE reconciled_transactions (
              reconciliation_id UUID NOT NULL REFERENCES reconciliations(id) ON DELETE CASCADE,
              bank_transaction_id UUID NOT NULL REFERENCES bank_transactions(id) ON DELETE CASCADE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              PRIMARY KEY (reconciliation_id, bank_transaction_id)
            );
          ```
        [ ] Verify Tables Created
[ ] **4. Document Management**

    [ ] **4.1. Documents Table**
        [ ] Execute the following SQL:
        ```sql
            CREATE TABLE documents (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              name VARCHAR(255) NOT NULL,
              file_path VARCHAR(500) NOT NULL,
              file_size INTEGER NOT NULL,
              file_type VARCHAR(100) NOT NULL,
              document_type VARCHAR(50),
              original_filename VARCHAR(255),
              upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              md5_hash VARCHAR(32),
              status VARCHAR(50) DEFAULT 'pending',
              ocr_data JSONB,
              ai_classification JSONB,
              confidence_score DECIMAL(5,2),
              uploaded_by UUID REFERENCES users(id),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        ```
        [ ] Verify Table Created

    [ ] **4.2. Document Links**
        [ ] Execute the following SQL:
        ```sql
          CREATE TABLE document_links (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            entity_type VARCHAR(50) NOT NULL,
            entity_id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES users(id),
            UNIQUE (document_id, entity_type, entity_id)
          );
        ```
        [ ] Verify Table Created

    [ ] **4.3. Document Processing Queue**
    [ ] Execute the following SQL:
        ```sql
          CREATE TABLE document_processing_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            processing_type VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            attempts INTEGER DEFAULT 0,
            last_attempt_at TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            result JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        ```
        [ ] Verify Table Created

[ ] **5. Contacts (Customers & Suppliers)**

    [ ] **5.1. Contacts Table**
        [ ] Execute the following SQL:
        ```sql
        CREATE TABLE contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          company_name VARCHAR(255),
          vat_number VARCHAR(50),
          company_registration VARCHAR(50),
          email VARCHAR(255),
          phone VARCHAR(50),
          website VARCHAR(255),
          address_line1 VARCHAR(255),
          address_line2 VARCHAR(255),
          city VARCHAR(100),
          county VARCHAR(100),
          postcode VARCHAR(20),
          country VARCHAR(100) DEFAULT 'United Kingdom',
          currency VARCHAR(3) DEFAULT 'GBP',
          default_payment_terms INTEGER,
          credit_limit DECIMAL(15,2),
          is_active BOOLEAN DEFAULT TRUE,
          notes TEXT,
          custom_fields JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ```
        [ ] Verify Table Created
    [ ] **5.2. Contact Persons**
        [ ] Execute the following SQL:
        ```sql
          CREATE TABLE contact_persons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            position VARCHAR(100),
            email VARCHAR(255),
            phone VARCHAR(50),
            is_primary BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        ```
        [ ] Verify Table Created
[ ] **6. Tax & Compliance**

    [ ] **6.1. VAT Returns**
    [ ] Execute the following SQL:
        ```sql
          CREATE TABLE vat_returns (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            due_date DATE NOT NULL,
            box1 DECIMAL(15,2) DEFAULT 0,
            box2 DECIMAL(15,2) DEFAULT 0,
            box3 DECIMAL(15,2) DEFAULT 0,
            box4 DECIMAL(15,2) DEFAULT 0,
            box5 DECIMAL(15,2) DEFAULT 0,
            box6 DECIMAL(15,2) DEFAULT 0,
            box7 DECIMAL(15,2) DEFAULT 0,
            box8 DECIMAL(15,2) DEFAULT 0,
            box9 DECIMAL(15,2) DEFAULT 0,
            status VARCHAR(50) DEFAULT 'draft',
            submission_id VARCHAR(255),
            submitted_at TIMESTAMP WITH TIME ZONE,
            submitted_by UUID REFERENCES users(id),
            is_adjustment BOOLEAN DEFAULT FALSE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        ```
        [ ] Verify Table Created

    [ ] **6.2. CIS (Construction Industry Scheme)**
        [ ] Execute the following SQL:
        ```sql
            CREATE TABLE cis_subcontractors (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              contact_id UUID NOT NULL REFERENCES contacts(id),
              utr VARCHAR(50),
              company_utr VARCHAR(50),
              verification_number VARCHAR(50),
              verification_date DATE,
              verification_status VARCHAR(50),
              deduction_rate DECIMAL(5,2) NOT NULL,
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE cis_deductions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              subcontractor_id UUID NOT NULL REFERENCES cis_subcontractors(id),
              transaction_id UUID REFERENCES transactions(id),
              payment_date DATE NOT NULL,
              gross_amount DECIMAL(15,2) NOT NULL,
              deduction_amount DECIMAL(15,2) NOT NULL,
              cost_of_materials DECIMAL(15,2) DEFAULT 0,
              reporting_period VARCHAR(7) NOT NULL,
              reported BOOLEAN DEFAULT FALSE,
              statement_sent BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE cis_returns (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              tax_month VARCHAR(7) NOT NULL,
              submission_date DATE,
              status VARCHAR(50) DEFAULT 'draft',
              submission_id VARCHAR(255),
              employment_count INTEGER DEFAULT 0,
              total_deductions DECIMAL(15,2) DEFAULT 0,
              total_paid DECIMAL(15,2) DEFAULT 0,
              notes TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        ```
        [ ] Verify Tables Created

    [ ] **6.3. HMRC API Integration**
        [ ] Execute the following SQL:
        ```sql
          CREATE TABLE hmrc_connections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            service VARCHAR(50) NOT NULL,
            access_token TEXT,
            refresh_token TEXT,
            token_expires_at TIMESTAMP WITH TIME ZONE,
            status VARCHAR(50) DEFAULT 'disconnected',
            last_connected_at TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        ```
        [ ] Verify Table Created
    [ ] **6.4. Companies House Integration**
        [ ] Execute the following SQL:
        ```sql
          CREATE TABLE companies_house_connections (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            api_key VARCHAR(255),
            status VARCHAR(50) DEFAULT 'disconnected',
            last_connected_at TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          CREATE TABLE companies_house_filings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            filing_type VARCHAR(50) NOT NULL,
            period_end_date DATE,
            filing_date DATE,
            status VARCHAR(50),
            due_date DATE,
            transaction_id VARCHAR(255),
            submission_number VARCHAR(255),
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        ```
        [ ] Verify Tables Created

[ ] **7. AI & Machine Learning Models**

    [ ] **7.1. Transaction Categorization**
        [ ] Execute the following SQL:
        ```sql
          CREATE TABLE ai_categorization_models (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            model_version VARCHAR(50) NOT NULL,
            accuracy DECIMAL(5,2),
            trained_at TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT TRUE,
            parameters JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          CREATE TABLE ai_categorization_feedback (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            model_id UUID REFERENCES ai_categorization_models(id),
            transaction_id UUID,
            suggested_category_id UUID,
            actual_category_id UUID,
            suggestion_confidence DECIMAL(5,2),
            was_accepted BOOLEAN,
            feedback_source VARCHAR(50),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by UUID REFERENCES users(id)
          );
        ```
        [ ] Verify Tables Created
    [ ] **7.2. Document Processing Models**
        [ ] Execute the following SQL:
        ```sql
            CREATE TABLE ai_document_extraction_templates (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              name VARCHAR(255) NOT NULL,
              document_type VARCHAR(50) NOT NULL,
              fields JSONB NOT NULL,
              is_system_template BOOLEAN DEFAULT FALSE,
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE ai_document_extraction_results (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
              document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
              template_id UUID REFERENCES ai_document_extraction_templates(id),
              extracted_data JSONB,
              confidence_scores JSONB,
              processing_time INTEGER,
              was_successful BOOLEAN,
              error_message TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        ```
        [ ] Verify Tables Created
... (Continue this pattern for sections 8 onwards - include SQL wherever database tables are defined.)


[ ] **1. Multi-Tenant Database Schema**

    [ ] **1.1. Organizations Table**
        [ ] Create `organizations` table with specified columns and data types.
        [ ] Add default values and constraints as defined (e.g., `gen_random_uuid()`, `NOT NULL`, `DEFAULT 'GBP'`).
        [ ] Verify `business_type` uses the correct enum values.
        [ ] Ensure `data_retention_period` defaults to 84 months.
        [ ] Add indexes on frequently queried columns (e.g., `name`, `registration_number`, `created_at`).
        [ ] Test table creation and data insertion.

    [ ] **1.2. Users Table**
        [ ] Create `users` table with specified columns and data types.
        [ ] Ensure `email` is unique and not null.
        [ ] Add secure password hashing (e.g., bcrypt).  Do *not* store plain text passwords.
        [ ] Implement token generation for verification and password resets.
        [ ] Implement logic for `last_login_at` updates.
        [ ] Add a foreign key constraint to `organizations(id)` for `default_organization_id`.
        [ ] Test user creation, authentication, and token handling.

    [ ] **1.3. Organization User Roles**
        [ ] Create `organization_users` table.
        [ ] Enforce the `UNIQUE (organization_id, user_id)` constraint.
        [ ] Verify `role` uses the correct enum values.
        [ ] Add foreign key constraints to `organizations(id)` and `users(id)`.
        [ ] Implement invitation logic (token generation, acceptance tracking).
        [ ] Test role assignment and user association with organizations.

    [ ] **1.4. Accounting Firm to Client Relationships**
        [ ] Create `accounting_firm_clients` table.
        [ ] Enforce the `UNIQUE (firm_organization_id, client_organization_id)` constraint.
        [ ] Verify `relationship_status` uses the correct enum values.
        [ ] Add foreign key constraints to `organizations(id)` and `users(id)`.
        [ ] Test relationship creation and management.

    [ ] **1.5. Permissions Table**
        [ ] Create `permissions` table.
        [ ] Enforce the `UNIQUE (name)` constraint.
        [ ] Verify `category` uses the correct categories.
        [ ] Populate with an initial set of permissions (this will likely be iterative).

        [ ] Create `role_permissions` table.
        [ ] Add foreign key constraints.
        [ ] Define default role-permission mappings.

        [ ] Create `user_permissions` table.
        [ ] Add foreign key constraints.
        [ ] Implement logic for granting/revoking individual user permissions.

[ ] **2. Chart of Accounts & Financial Structure**

    [ ] **2.1. Account Categories Table**
        [ ] Create `account_categories` table.
        [ ] Verify `type` and other enums use correct values.
        [ ] Add initial system categories (`is_system_category = TRUE`).
        [ ] Implement `display_order`.
        [ ] Test category creation and management.

    [ ] **2.2. Accounts Table**
        [ ] Create `accounts` table.
        [ ] Enforce the `UNIQUE (organization_id, code)` constraint.
        [ ] Add a foreign key constraint to `account_categories(id)`.
        [ ] Implement `bank_account_details` as JSONB.
        [ ] Test account creation, including bank account details.

    [ ] **2.3. Account Templates for UK Business Types**
        [ ] Create `account_templates` table.
        [ ] Verify `business_type` uses correct values.
        [ ] Create `template_accounts` table.
        [ ] Add foreign key constraints.
        [ ] Populate with standard UK account templates.

    [ ] **2.4. VAT Configuration**
        [ ] Create `vat_schemes` table.
        [ ] Verify `scheme_type` uses correct values.
        [ ] Implement `flat_rate_percentage` validation.

        [ ] Create `vat_rates` table.
        [ ] Implement `effective_from` and `effective_to` logic.

        [ ] Create `vat_return_periods` table.
        [ ] Implement `period_type` and `quarters_start_month` logic.

[ ] **3. Transactions & Banking Core**

    [ ] **3.1. Bank Accounts**
        [ ] Create `bank_accounts` table.
        [ ] Add foreign key constraints.
        [ ] Implement `open_banking_status` enum.

    [ ] **3.2. Bank Transactions**
        [ ] Create `bank_transactions` table.
        [ ] Add foreign key constraints.
        [ ] Verify `transaction_type` uses correct values.
        [ ] Implement `import_id` and `import_hash` for duplicate prevention.
        [ ] Implement created and updated by user references.

    [ ] **3.3. Transactions (Double-Entry)**
        [ ] Create `transactions` table.
        [ ] Add foreign key constraints.
        [ ] Verify `transaction_type` and `status` use correct values.
        [ ] Implement created and updated by user references.

    [ ] **3.4. Transaction Lines**
        [ ] Create `transaction_lines` table.
        [ ] Add foreign key constraints.
        [ ] Enforce `debit_credit` as 'D' or 'C'.

    [ ] **3.5. Reconciliation**
        [ ] Create `reconciliations` table.
        [ ] Add foreign key constraints.
        [ ] Implement `is_complete` logic.
        [ ] Create and updated by user references.

        [ ] Create `reconciled_transactions` table.
        [ ] Add foreign key constraints and primary key.

[ ] **4. Document Management**

    [ ] **4.1. Documents Table**
        [ ] Create `documents` table.
        [ ] Implement `md5_hash` for deduplication.
        [ ] Verify `document_type` and `status` use correct values.
         [ ] Implement uploaded by user references

    [ ] **4.2. Document Links**
        [ ] Create `document_links` table.
        [ ] Enforce the `UNIQUE (document_id, entity_type, entity_id)` constraint.
        [ ] Verify `entity_type` uses correct values.
        [ ] Implement created by user references.

    [ ] **4.3. Document Processing Queue**
        [ ] Create `document_processing_queue` table.
        [ ] Verify `processing_type` and `status` use correct values.

[ ] **5. Contacts (Customers & Suppliers)**

    [ ] **5.1. Contacts Table**
        [ ] Create `contacts` table.
        [ ] Verify `type` uses correct values.

    [ ] **5.2. Contact Persons**
        [ ] Create `contact_persons` table.
        [ ] Add foreign key constraint.

[ ] **6. Tax & Compliance**

    [ ] **6.1. VAT Returns**
        [ ] Create `vat_returns` table.
        [ ] Verify `status` uses correct values.
         [ ] Implement submitted by user references

    [ ] **6.2. CIS (Construction Industry Scheme)**
        [ ] Create `cis_subcontractors` table.
        [ ] Verify `verification_status` uses correct values.

        [ ] Create `cis_deductions` table.

        [ ] Create `cis_returns` table.
        [ ] Verify `status` uses correct values.

    [ ] **6.3. HMRC API Integration**
        [ ] Create `hmrc_connections` table.
        [ ] Verify `service` and `status` use correct values.
        [ ] Implement secure storage of tokens.

    [ ] **6.4. Companies House Integration**
        [ ] Create `companies_house_connections` table.
        [ ] Verify `status` uses correct values.

        [ ] Create `companies_house_filings` table.
        [ ] Verify `filing_type` and `status` use correct values.

[ ] **7. AI & Machine Learning Models**

    [ ] **7.1. Transaction Categorization**
        [ ] Create `ai_categorization_models` table.

        [ ] Create `ai_categorization_feedback` table.
         [ ] Implement created by user references

    [ ] **7.2. Document Processing Models**
        [ ] Create `ai_document_extraction_templates` table.
        [ ] Verify `document_type` uses correct values.

        [ ] Create `ai_document_extraction_results` table.

[ ] **8. Front-End Components**

    [ ] **8.1. Core Transaction Grid Interface**
        [ ] Build TransactionGrid.tsx component.
        [ ] Implement row virtualization.
        [ ] Add keyboard navigation.
        [ ] Create right-click context menu.
        [ ] Create `DateCellEditor` component.
        [ ] Create `CurrencyCellEditor` component.
        [ ] Create `CategoryCellEditor` component.
        [ ] Create `ContactCellEditor` component.
        [ ] Create `DescriptionCellEditor` component.
        [ ] Implement inline editing with `onCellValueChange`.
        [ ] Create validation rules.
        [ ] Add undo/redo functionality.
        [ ] Build quick filters.
        [ ] Implement advanced filter builder.
        [ ] Add saved filter functionality.
        [ ] Create date range selectors.
        [ ] Create column visibility toggle.
        [ ] Add drag-and-drop column reordering.
        [ ] Build column width resizing.
        [ ] Add pinned columns functionality.

    [ ] **8.2. Floating Window System**
        [ ] Implement FloatingPanel.tsx component.
        [ ] Add window controls.
        [ ] Create snap-to-grid functionality.
        [ ] Add z-index management.
        [ ] Create content registry.
        [ ] Implement panel state persistence.
        [ ] Add panel presets.
        [ ] Build responsive layout adjustments.
        [ ] Create "open in new panel" actions.
        [ ] Add synchronized scrolling.
        [ ] Implement cross-panel data selection.
        [ ] Build panel grouping.

    [ ] **8.3. Summary Components**
        [ ] Implement balance cards.
        [ ] Create transaction summary.
        [ ] Build period comparison.
        [ ] Add drill-down capability.
        [ ] Build expense breakdown charts.
        [ ] Implement cash flow visualization.
        [ ] Create aged debtors/creditors summaries.
        [ ] Add tax liability indicators.

[ ] **9. API Endpoints**

    [ ] **9.1. Authentication & Users**
        [ ] Implement `/api/auth/register`.
        [ ] Implement `/api/auth/login`.
        [ ] Implement `/api/auth/refresh-token`.
        [ ] Implement `/api/auth/forgot-password`.
        [ ] Implement `/api/auth/reset-password`.
        [ ] Implement `/api/auth/verify-email`.
        [ ] Implement `/api/users/me`.
        [ ] Implement `/api/users/me/organizations`.
        [ ] Implement `/api/organizations/:id/users`.
        [ ] Implement `/api/organizations/:id/invitations`.

    [ ] **9.2. Organizations & Settings**
        [ ] Implement `/api/organizations`.
        [ ] Implement `/api/organizations/:id`.
        [ ] Implement `/api/organizations/:id/settings`.
        [ ] Implement `/api/organizations/:id/fiscal-years`.
        [ ] Implement `/api/organizations/:id/chart-of-accounts`.
        [ ] Implement `/api/organizations/:id/vat-settings`.
        [ ] Implement `/api/accounting-firms/:id/clients`.

    [ ] **9.3. Transactions & Banking**
        [ ] Implement `/api/organizations/:id/bank-accounts`.
        [ ] Implement `/api/organizations/:id/bank-accounts/:accountId/transactions`.
        [ ] Implement `/api/organizations/:id/bank-accounts/:accountId/reconciliations`.
        [ ] Implement `/api/organizations/:id/transactions`.
        [ ] Implement `/api/organizations/:id/transactions/:transactionId/lines`.
        [ ] Implement `/api/organizations/:id/bank-feeds`.
        [ ] Implement `/api/organizations/:id/bank-feeds/:feedId/sync`.
        [ ] Implement `/api/organizations/:id/transactions/categorize`.

    [ ] **9.4. Documents & OCR**
        [ ] Implement `/api/organizations/:id/documents`.
        [ ] Implement `/api/organizations/:id/documents/:documentId`.
        [ ] Implement `/api/organizations/:id/documents/:documentId/process`.
        [ ] Implement `/api/organizations/:id/documents/:documentId/link`.
        [ ] Implement `/api/organizations/:id/documents/search`.
        [ ] Implement `/api/organizations/:id/documents/extract-transaction`.

    [ ] **9.5. Contacts**
        [ ] Implement `/api/organizations/:id/contacts`.
        [ ] Implement `/api/organizations/:id/contacts/:contactId`.
        [ ] Implement `/api/organizations/:id/contacts/:contactId/persons`.
        [ ] Implement `/api/organizations/:id/contacts/import`.
        [ ] Implement `/api/organizations/:id/contacts/search`.

    [ ] **9.6. Tax & Compliance**
        [ ] Implement `/api/organizations/:id/vat-returns`.
        [ ] Implement `/api/organizations/:id/vat-returns/:returnId/calculate`.
        [ ] Implement `/api/organizations/:id/vat-returns/:returnId/submit`.
        [ ] Implement `/api/organizations/:id/cis/subcontractors`.
        [ ] Implement `/api/organizations/:id/cis/deductions`.
        [ ] Implement `/api/organizations/:id/cis/returns`.
        [ ] Implement `/api/organizations/:id/hmrc/connect`.
        [ ] Implement `/api/organizations/:id/hmrc/status`.
        [ ] Implement `/api/organizations/:id/companies-house/search`.
        [ ] Implement `/api/organizations/:id/companies-house/company/:companyNumber`.

    [ ] **9.7. Reports & Analysis**
        [ ] Implement `/api/organizations/:id/reports/profit-loss`.
        [ ] Implement `/api/organizations/:id/reports/balance-sheet`.
        [ ] Implement `/api/organizations/:id/reports/trial-balance`.
        [ ] Implement `/api/organizations/:id/reports/vat-detail`.
        [ ] Implement `/api/organizations/:id/reports/aged-debtors`.
        [ ] Implement `/api/organizations/:id/reports/aged-creditors`.
        [ ] Implement `/api/organizations/:id/reports/cash-flow`.
        [ ] Implement `/api/organizations/:id/reports/custom`.
        [ ] Implement `/api/organizations/:id/reports/export`.
[ ] **10. Implementation Tasks - Database + Backend Logic**
   *See above sections 1-7, 9 for database setup*

    [ ] **10.1. Core User & Organization Systems**
        [ ] Implement user registration, login, and logout flows.
        [ ] Implement JWT authentication.
        [ ] Create password reset and email verification.
        [ ] Add two-factor authentication (optional).
        [ ] Implement role-based permissions system.
        [ ] Build organization creation API.
        [ ] Implement fiscal year configuration API.
        [ ] Create organization settings API.
        [ ] Add organization branding customization API.
        [ ] Build client organization management API.
        [ ] Create client invitation API.
        [ ] Implement client switching logic.
        [ ] Add permission assignment API.

    [ ] **10.2. Chart of Accounts & Financial Setup**
        [ ] Implement account categories and types API.
        [ ] Create account template API.
        [ ] Build account management API.
        [ ] Implement account import/export API.
        [ ] Create VAT schemes API.
        [ ] Build VAT rates API.
        [ ] Implement MTD settings API.
        [ ] Add fiscal year/period API.
        [ ] Build setup wizard API endpoints.

    [ ] **10.3. Banking & Transaction Management**
        [ ] Implement bank account management API.
        [ ] Build manual transaction entry API.
        [ ] Implement bank statement import API.
        [ ] Add Open Banking connection API.
        [ ] Implement transaction categorization API.
        [ ] Create bulk categorization API.
        [ ] Build reconciliation API.

    [ ] **10.4. Document Management & OCR**
        [ ] Implement document upload API.
        [ ] Build document organization API.
        [ ] Implement document preview API.
        [ ] Add document version control.
        [ ] Integrate OCR service.
        [ ] Create document-to-transaction API.
        [ ] Implement bulk document processing API.
        [ ] Build document search API.

    [ ] **10.5. Financial Reporting**
        [ ] Implement core report APIs (P&L, balance sheet, etc.).
        [ ] Build report customization API.
        [ ] Create KPI dashboard API.
        [ ] Implement report export API.

    [ ] **10.6. VAT & Tax Compliance**
        [ ] Build VAT return calculation API.
        [ ] Implement MTD VAT submission API.
        [ ] Create CIS subcontractor API.
        [ ] Implement CIS deduction API.
        [ ] Build CIS return API.
        [ ] Create tax reporting API endpoints.

    [ ] **10.7. Advanced Features**
        [ ] Implement multi-entity API.
        [ ] Build cash flow forecasting API.
        [ ] Create accountant workflow API.
        [ ] Implement AI-powered insights API.

[ ] **11. Companies House Integration**

    [ ] **11.1. Company Lookup and Registration**
        [ ] Implement Companies House API client.
        [ ] Create company search API.
        [ ] Implement company details retrieval API.
        [ ] Build company verification API.

    [ ] **11.2. Filing and Compliance**
        [ ] Create filing calendar API.
        [ ] Implement filing preparation API.
        [ ] Create filing submission API.

[ ] **12. UI/UX Implementation** - *See Section 8 for more detailed component tasks*

    [ ] **12.1. Dashboard & Navigation**
        [ ] Build main dashboard UI.
        [ ] Implement sidebar navigation.
        [ ] Create notification center.

    [ ] **12.2. Transaction Management Interface**
        [ ] Build bank-centric transaction view.
        [ ] Create spreadsheet-like editing.
        [ ] Implement floating panels.
        [ ] Create transaction details sidebar.

    [ ] **12.3. Report Viewers**
        [ ] Implement interactive report viewing.
        [ ] Create report customization.
        [ ] Implement report sharing.

    [ ] **12.4. Mobile Responsiveness**
        [ ] Implement responsive layouts.
        [ ] Create mobile-specific features.

[ ] **13. AI Implementation**

    [ ] **13.1. Transaction Categorization**
        [ ] Build AI categorization engine.
        [ ] Implement learning system.
        [ ] Create suggestion UI.

    [ ] **13.2. Document Processing**
        [ ] Implement document OCR pipeline.
        [ ] Create invoice/receipt processing.
        [ ] Implement automatic transaction creation.

    [ ] **13.3. Forecasting & Analysis**
        [ ] Build cash flow prediction.
        [ ] Create anomaly detection.
        [ ] Implement business insights.

[ ] **14. Essential Coding Details**

    [ ] **14.0. Development Environment Setup**
        [ ] Configure Next.js with TypeScript.
        [ ] Set up PostgreSQL.
        [ ] Set up Prisma ORM.
        [ ] Configure ESLint and Prettier.
        [ ] Set up Jest and React Testing Library.
        [ ] Create Docker development environment.
        [ ] Implement CI/CD pipeline.

    [ ] **14.1. Database Access Layer**
        [ ] Create repository pattern implementation.
        [ ] Implement multi-tenant data access.

    [ ] **14.2. API Layer**
        [ ] Create RESTful API controllers.
        [ ] Implement authentication and authorization.

    [ ] **14.3. React Component Library**
        [ ] Build core UI components.
        [ ] Implement specialized accounting components.

    [ ] **14.4. State Management**
        [ ] Create global state management (Redux).
        [ ] Implement form state management.

    [ ] **14.5. Error Handling & Logging**
        [ ] Create comprehensive error handling.
        [ ] Implement logging system.

[ ] **15. Specific UK Accounting Requirements**

    [ ] **15.1. FRS 102 Compliance**
        [ ] Implement FRS 102 accounting rules.
        [ ] Implement accounting adjustments.

    [ ] **15.2. HMRC Integration**
        [ ] Build MTD compliance.
        [ ] Implement Corporation Tax features.
        [ ] Build Self Assessment support.

    [ ] **15.3. Payroll Integration**
        [ ] Implement payroll summary import.
        [ ] Create director remuneration tracking.

    [ ] **15.4. UK Business Reporting**
        [ ] Implement Companies House submissions.
        [ ] Create industry-specific reporting.

[ ] **16. Client Portal Implementation**

    [ ] **16.1. Client-Specific Interface**
        [ ] Create simplified client dashboard.
        [ ] Implement client task management.

    [ ] **16.2. Client Communication**
        [ ] Build secure messaging system.
        [ ] Implement approval workflows.

    [ ] **16.3. Client Document Management**
        [ ] Create client document portal.
        [ ] Implement document request workflow.

[ ] **17. API Integrations**

    [ ] **17.1. Open Banking**
        [ ] Implement Open Banking connections.
        [ ] Create transaction processing pipeline.

    [ ] **17.2. Payment Services**
        [ ] Implement payment initiation.
        [ ] Create payment status tracking.

    [ ] **17.3. Third-Party Services**
        [ ] Implement document storage integrations.
        [ ] Create calendar integrations.

    [ ] **17.4. Data Import/Export**
        [ ] Implement accounting system migration.
        [ ] Create spreadsheet import/export.

[ ] **18. Specific UI Components**
 *See Section 8 for more detailed component tasks*
    [ ] **18.1. Transaction Management**
        [ ] Build bank reconciliation screen.
        [ ] Create transaction entry form.
        [ ] Implement bank feed dashboard.

    [ ] **18.2. Report Builder**
        [ ] Create report designer.
        [ ] Implement report viewer.

    [ ] **18.3. Dashboard Components**
        [ ] Create KPI widgets.
        [ ] Implement data visualization components.

    [ ] **18.4. Mobile Components**
        [ ] Create responsive transaction list.
        [ ] Implement mobile document capture.