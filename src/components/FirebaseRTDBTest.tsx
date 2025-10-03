'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { setData, getData } from '@/db/realtimeDB.utils';

export default function FirebaseRTDBTest() {
    const { user, isAuthenticated } = useAuth();
    const [testResult, setTestResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const testFirebaseRTDB = async () => {
        if (!isAuthenticated || !user?.uid) {
            setTestResult('❌ User not authenticated');
            return;
        }

        setIsLoading(true);
        setTestResult('🔄 Testing Firebase Realtime Database...');

        try {
            const testPath = `test/${user.uid}/timestamp`;
            const testData = {
                message: 'Hello Firebase RTDB!',
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            };

            console.log('🧪 Testing RTDB with path:', testPath);

            // Test write
            await setData(testPath, testData);
            setTestResult(prev => prev + '\n✅ Write test successful');

            // Test read
            const readData = await getData(testPath);
            console.log('📖 Read data:', readData);

            if (readData) {
                setTestResult(prev => prev + '\n✅ Read test successful');
                setTestResult(prev => prev + `\n📦 Data: ${JSON.stringify(readData, null, 2)}`);
            } else {
                setTestResult(prev => prev + '\n❌ Read test failed - no data returned');
            }

        } catch (error) {
            console.error('❌ Firebase RTDB test failed:', error);
            setTestResult(prev => prev + `\n❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
                <p>Please log in to test Firebase Realtime Database</p>
            </div>
        );
    }

    return (
        <div className="p-4 border border-blue-300 bg-blue-50 rounded">
            <h3 className="text-lg font-semibold mb-4">Firebase Realtime Database Test</h3>

            <button
                onClick={testFirebaseRTDB}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {isLoading ? 'Testing...' : 'Test Firebase RTDB'}
            </button>

            {testResult && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                    <h4 className="font-semibold mb-2">Test Results:</h4>
                    <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>User ID:</strong> {user?.uid}</p>
                <p><strong>Environment Check:</strong></p>
                <ul className="list-disc list-inside ml-4">
                    <li>Database URL: {process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? '✅ Set' : '❌ Missing'}</li>
                    <li>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</li>
                    <li>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</li>
                </ul>
            </div>
        </div>
    );
}