import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export default function LinkedInCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

//  



  if (status === 'loading') {
    return <div className="flex flex-col items-center justify-center min-h-screen text-lg">Connecting to LinkedIn...</div>;
  }
  if (status === 'success') {
    return <div className="flex flex-col items-center justify-center min-h-screen text-green-600 text-2xl font-bold">LinkedIn Connected Successfully!</div>;
  }
  return <div className="flex flex-col items-center justify-center min-h-screen text-red-600 text-xl font-bold">Failed to connect LinkedIn.</div>;
}
