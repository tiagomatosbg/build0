"""create jobs table

Revision ID: create_jobs_table
Revises: create_departments_table
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'create_jobs_table'
down_revision = 'create_departments_table'
branch_labels = None
depends_on = None

def upgrade():
    # Create enum types
    job_status = postgresql.ENUM('open', 'screening', 'interviewing', 'closed', 'cancelled',
                                name='jobstatus', create_type=True)
    job_type = postgresql.ENUM('full_time', 'part_time', 'contract', 'temporary', 'internship',
                              name='jobtype', create_type=True)
    
    # Create jobs table
    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('department_id', sa.Integer(), nullable=False),
        sa.Column('manager_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('requirements', sa.Text(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('salary_min', sa.Float(), nullable=True),
        sa.Column('salary_max', sa.Float(), nullable=True),
        sa.Column('benefits', sa.Text(), nullable=True),
        sa.Column('type', job_type, nullable=False),
        sa.Column('status', job_status, nullable=False, server_default='open'),
        sa.Column('opening_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('closing_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
        sa.ForeignKeyConstraint(['manager_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
    op.drop_table('jobs')
    op.execute('DROP TYPE jobstatus')
    op.execute('DROP TYPE jobtype') 