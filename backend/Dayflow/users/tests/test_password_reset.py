from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core import mail
from users.models import User


class PasswordResetTestCase(APITestCase):
    """Test password reset and change password functionality"""
    
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='oldpassword123',
            employee_id='EMP001',
            role='EMPLOYEE'
        )
    
    def test_password_reset_request(self):
        """Test requesting password reset"""
        url = reverse('password-reset-request')
        data = {'email': 'test@example.com'}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Check that email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Password Reset Request', mail.outbox[0].subject)
        self.assertIn('test@example.com', mail.outbox[0].to)
    
    def test_password_reset_request_nonexistent_email(self):
        """Test password reset request with non-existent email"""
        url = reverse('password-reset-request')
        data = {'email': 'nonexistent@example.com'}
        
        response = self.client.post(url, data)
        
        # Should return success to avoid revealing if email exists
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # No email should be sent
        self.assertEqual(len(mail.outbox), 0)
    
    def test_password_reset_request_missing_email(self):
        """Test password reset request without email"""
        url = reverse('password-reset-request')
        data = {}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_password_reset_confirm(self):
        """Test confirming password reset with valid token"""
        # Generate token
        token = default_token_generator.make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        
        url = reverse('password-reset-confirm')
        data = {
            'uid': uid,
            'token': token,
            'new_password': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))
        self.assertFalse(self.user.check_password('oldpassword123'))
    
    def test_password_reset_confirm_invalid_token(self):
        """Test confirming password reset with invalid token"""
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        
        url = reverse('password-reset-confirm')
        data = {
            'uid': uid,
            'token': 'invalid-token',
            'new_password': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        
        # Verify password was NOT changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('oldpassword123'))
    
    def test_password_reset_confirm_invalid_uid(self):
        """Test confirming password reset with invalid UID"""
        token = default_token_generator.make_token(self.user)
        
        url = reverse('password-reset-confirm')
        data = {
            'uid': 'invalid-uid',
            'token': token,
            'new_password': 'newpassword123'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_password_reset_confirm_missing_fields(self):
        """Test confirming password reset with missing fields"""
        url = reverse('password-reset-confirm')
        data = {'uid': 'some-uid'}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_change_password_authenticated(self):
        """Test changing password for authenticated user"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('change-password')
        data = {
            'old_password': 'oldpassword123',
            'new_password': 'newpassword456'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword456'))
        self.assertFalse(self.user.check_password('oldpassword123'))
    
    def test_change_password_wrong_old_password(self):
        """Test changing password with incorrect old password"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('change-password')
        data = {
            'old_password': 'wrongpassword',
            'new_password': 'newpassword456'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        
        # Verify password was NOT changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('oldpassword123'))
    
    def test_change_password_missing_fields(self):
        """Test changing password with missing fields"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('change-password')
        data = {'old_password': 'oldpassword123'}
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_change_password_unauthenticated(self):
        """Test changing password without authentication"""
        url = reverse('change-password')
        data = {
            'old_password': 'oldpassword123',
            'new_password': 'newpassword456'
        }
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_password_reset_email_content(self):
        """Test password reset email contains correct information"""
        url = reverse('password-reset-request')
        data = {'email': 'test@example.com'}
        
        response = self.client.post(url, data)
        
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        
        # Check email content
        self.assertIn('testuser', email.body)
        self.assertIn('reset-password', email.body)
        self.assertIn('expire', email.body.lower())
    
    def test_token_reuse_prevention(self):
        """Test that token cannot be reused after successful reset"""
        # Generate token and reset password
        token = default_token_generator.make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        
        url = reverse('password-reset-confirm')
        data = {
            'uid': uid,
            'token': token,
            'new_password': 'newpassword123'
        }
        
        # First reset should succeed
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Try to reuse the same token
        data['new_password'] = 'anotherpassword456'
        response = self.client.post(url, data)
        
        # Should fail - token is invalid after password change
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify password is still the first new password
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))
        self.assertFalse(self.user.check_password('anotherpassword456'))
