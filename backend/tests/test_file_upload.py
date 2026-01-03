from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import User, EmployeeProfile


class FileUploadTestCase(APITestCase):
    """Test file upload functionality"""
    
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            employee_id='EMP001',
            role='EMPLOYEE'
        )
        
        # Create profile
        self.profile = EmployeeProfile.objects.create(
            user=self.user,
            full_name='Test User',
            job_title='Developer'
        )
        
        # Login
        self.client.force_authenticate(user=self.user)
    
    def test_upload_profile_picture(self):
        """Test uploading profile picture"""
        url = reverse('employee-profile')
        
        # Create a minimal valid JPEG image (1x1 pixel)
        image = SimpleUploadedFile(
            name='test_image.jpg',
            content=b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfe\xf5\xff\xd9',
            content_type='image/jpeg'
        )
        
        data = {'profile_picture': image}
        response = self.client.put(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.profile_picture)
    
    def test_upload_resume(self):
        """Test uploading resume"""
        url = reverse('employee-profile')
        
        # Create a fake PDF file
        resume = SimpleUploadedFile(
            name='resume.pdf',
            content=b'fake pdf content',
            content_type='application/pdf'
        )
        
        data = {'resume': resume}
        response = self.client.put(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.resume)
    
    def test_upload_id_proof(self):
        """Test uploading ID proof"""
        url = reverse('employee-profile')
        
        # Create a fake document file
        id_proof = SimpleUploadedFile(
            name='id_proof.pdf',
            content=b'fake document content',
            content_type='application/pdf'
        )
        
        data = {'id_proof': id_proof}
        response = self.client.put(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.id_proof)
    
    def test_upload_multiple_files(self):
        """Test uploading multiple files at once"""
        url = reverse('employee-profile')
        
        # Create a minimal valid JPEG image
        image = SimpleUploadedFile(
            'photo.jpg',
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfe\xf5\xff\xd9',
            content_type='image/jpeg'
        )
        resume = SimpleUploadedFile('resume.pdf', b'resume', content_type='application/pdf')
        id_proof = SimpleUploadedFile('id.pdf', b'id', content_type='application/pdf')
        
        data = {
            'profile_picture': image,
            'resume': resume,
            'id_proof': id_proof,
            'phone': '1234567890'
        }
        
        response = self.client.put(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertTrue(self.profile.profile_picture)
        self.assertTrue(self.profile.resume)
        self.assertTrue(self.profile.id_proof)
        self.assertEqual(self.profile.phone, '1234567890')
