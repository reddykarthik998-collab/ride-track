import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Card, { CardContent, CardHeader, CardFooter } from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const AccountSettings: React.FC = () => {
    const { adminPassword, updateAdminPassword, addToast } = useAppContext();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const clearForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
    };
    
    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!currentPassword) {
            newErrors.currentPassword = 'Current password is required.';
        } else if (currentPassword !== adminPassword) {
            newErrors.currentPassword = 'Current password does not match.';
        }

        if (!newPassword) {
            newErrors.newPassword = 'New password is required.';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters long.';
        }

        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            updateAdminPassword(newPassword);
            addToast('Password updated successfully!', 'success');
            clearForm();
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold text-neutral-800">Account Settings</h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                             <h3 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2">Change Password</h3>
                             <div className="space-y-4">
                                <Input
                                    id="current-password"
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    error={errors.currentPassword}
                                    required
                                />
                                <Input
                                    id="new-password"
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    error={errors.newPassword}
                                    required
                                />
                                <Input
                                    id="confirm-password"
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    error={errors.confirmPassword}
                                    required
                                />
                             </div>
                        </div>
                         <div>
                             <h3 className="text-lg font-semibold text-neutral-700 mb-4 border-b pb-2">Account Information</h3>
                             <div className="space-y-2 text-sm">
                                <p><span className="font-medium text-neutral-600">Username:</span> admin</p>
                                <p><span className="font-medium text-neutral-600">Role:</span> Company Administrator</p>
                             </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={clearForm}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default AccountSettings;
