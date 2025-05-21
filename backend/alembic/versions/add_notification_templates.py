"""add notification templates

Revision ID: add_notification_templates
Revises: previous_revision
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_notification_templates'
down_revision = 'previous_revision'  # Substitua pelo ID da última revisão
branch_labels = None
depends_on = None

def upgrade():
    # Adiciona colunas para templates de notificação
    op.add_column('pipeline_etapas', sa.Column('template_email', sa.Text(), nullable=True))
    op.add_column('pipeline_etapas', sa.Column('template_whatsapp', sa.Text(), nullable=True))

def downgrade():
    # Remove colunas de templates
    op.drop_column('pipeline_etapas', 'template_whatsapp')
    op.drop_column('pipeline_etapas', 'template_email') 