from celery import shared_task
from .models import ExportJob


@shared_task
def process_export_job(job_id):
    try:
        job = ExportJob.objects.get(id=job_id)
        job.status = 'processing'
        job.save()
        
        # Aquí iría la lógica de exportación
        # Por ahora solo simulamos el proceso
        
        job.status = 'completed'
        job.save()
        
        return f"Export job {job_id} completed successfully"
    except ExportJob.DoesNotExist:
        return f"Export job {job_id} not found"
    except Exception as e:
        job = ExportJob.objects.get(id=job_id)
        job.status = 'failed'
        job.save()
        return f"Export job {job_id} failed: {str(e)}"
