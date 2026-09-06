import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'forum_project.settings')

from forum_project.wsgi import application

app = application

# Initialize the database automatically for the serverless deployment.
from django.core.management import call_command
from posts.models import Thread, Post

try:
	call_command('migrate', interactive=False, verbosity=0)
except Exception:
	# Let the request surface the database error if the provider is unavailable.
	pass

try:
	if not Thread.objects.exists():
		demo_threads = [
			('The Future of AI in Education', 'AI can personalize learning, but schools need responsible assessment policies.', 'Sarah Chen'),
			('React vs Vue in 2025', 'React has the larger ecosystem, while Vue offers a simpler developer experience.', 'FrontendDev'),
			('Global Warming Solutions: Nuclear?', 'Rapid decarbonization will likely require a mix of renewables and nuclear power.', 'PhysicsGrad'),
		]
		for title, content, author in demo_threads:
			thread = Thread.objects.create(title=title)
			Post.objects.create(thread=thread, content=content, author_name=author)
except Exception:
	pass