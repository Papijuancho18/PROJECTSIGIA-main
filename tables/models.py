from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Table(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    columns = models.JSONField(default=list)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class TableData(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='data')
    row_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
