import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'forum_project.settings')

from forum_project.wsgi import application

app = application