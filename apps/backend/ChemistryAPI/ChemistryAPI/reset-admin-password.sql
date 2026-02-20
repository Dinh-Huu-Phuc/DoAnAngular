-- Reset admin password to "123456"
-- SHA256 hash of "123456" is: 8D969EEF6ECAD3C29A3A629280E686CF0C3F5D5A86AFF3CA12020C923ADC6C92

UPDATE Users 
SET PasswordHash = '8D969EEF6ECAD3C29A3A629280E686CF0C3F5D5A86AFF3CA12020C923ADC6C92'
WHERE Email = 'TanThuyHoang@admin.com';

-- Verify the update
SELECT Id, Username, Email, Role, PasswordHash 
FROM Users 
WHERE Email = 'TanThuyHoang@admin.com';
