from django.db import models

class Thread(models.Model):
    title = models.CharField(max_length=200)
    summary = models.TextField(blank=True, help_text="Auto-generated summary.")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

class Post(models.Model):
    thread = models.ForeignKey(Thread, related_name='posts', on_delete=models.CASCADE)
    content = models.TextField(help_text="Enter the text of the post.")
    author_name = models.CharField(max_length=100, default="Anonymous")
    created_at = models.DateTimeField(auto_now_add=True)
    # Removing 'votes' and 'summary' from individual posts as per new design (thread has summary)

    def __str__(self):
        return f"Post in {self.thread.title} by {self.author_name}"

    class Meta:
        ordering = ['created_at']
