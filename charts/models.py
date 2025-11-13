from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Chart(models.Model):
    CHART_TYPES = [
        ('bar', 'Bar Chart'),
        ('line', 'Line Chart'),
        ('pie', 'Pie Chart'),
        ('scatter', 'Scatter Plot'),
        ('area', 'Area Chart'),
    ]
    
    name = models.CharField(max_length=255)
    chart_type = models.CharField(max_length=20, choices=CHART_TYPES)
    description = models.TextField(blank=True)
    config = models.JSONField(default=dict)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class ChartData(models.Model):
    chart = models.ForeignKey(Chart, on_delete=models.CASCADE, related_name='data')
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
