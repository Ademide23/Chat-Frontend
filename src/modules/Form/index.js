import { useState, useEffect } from "react"
import Button from "../../components/Button"
import Input from "../../components/Input"
import { useNavigate } from 'react-router-dom'

// Simple Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// Loader Component
const Loader = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
    <span className="ml-2">Processing...</span>
  </div>
);

const Form = ({
    isSignInPage = true,
}) => {
    const [data, setData] = useState({
        ...(!isSignInPage && {
            fullName: ''
        }),
        email: '',
        password: ''
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const showToast = (message, type = 'error') => {
      setToast({ show: true, message, type });
    };

    const closeToast = () => {
      setToast({ ...toast, show: false });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch(`http://localhost:8000/api/${isSignInPage ? 'login' : 'register'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const resData = await res.json();
            
            if (!res.ok) {
                // Log and display error from backend
                console.error('Backend error:', resData);
                showToast(resData.message || 'Something went wrong. Please try again.');
            } else if (resData.token) {
                // Handle successful login/registration
                localStorage.setItem('user:token', resData.token);
                localStorage.setItem('user:detail', JSON.stringify(resData.user));
                showToast('Authentication successful!', 'success');
                
                // Short delay before navigation to show success toast
                setTimeout(() => {
                  navigate('/');
                }, 1000);
            } else {
                // Handle unexpected response format
                console.error('Unexpected response:', resData);
                showToast('Unexpected response from server. Please try again.');
            }
        } catch (err) {
            // Handle network or other errors
            console.error('Form submission error:', err);
            showToast('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    const isFormValid = () => {
      return data.email && data.password && (isSignInPage || data.fullName);
    };

    return (
        <div className="bg-light h-screen flex items-center justify-center">
            {toast.show && (
              <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={closeToast} 
              />
            )}
            
            <div className="bg-white w-[600px] h-[800px] shadow-lg rounded-lg flex flex-col justify-center items-center">
                <div className="text-3xl font-extrabold">Welcome {isSignInPage && 'Back'}</div>
                <div className="text-xl font-light mb-14">{isSignInPage ? 'Sign in to get explored' : 'Sign up to get started'}</div>
                
                <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
                    {!isSignInPage && (
                        <Input 
                            label="Full name" 
                            name="name" 
                            placeholder="Enter your full name" 
                            className="mb-6 w-[75%]" 
                            value={data.fullName} 
                            onChange={(e) => setData({ ...data, fullName: e.target.value })} 
                        />
                    )}
                    
                    <Input 
                        label="Email address" 
                        type="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        className="mb-6 w-[75%]" 
                        value={data.email} 
                        onChange={(e) => setData({ ...data, email: e.target.value })} 
                    />
                    
                    <Input 
                        label="Password" 
                        type="password" 
                        name="password" 
                        placeholder="Enter your Password" 
                        className="mb-14 w-[75%]" 
                        value={data.password} 
                        onChange={(e) => setData({ ...data, password: e.target.value })} 
                    />
                    
                    <Button 
                        label={loading ? <Loader /> : (isSignInPage ? 'Sign in' : 'Sign up')} 
                        type='submit' 
                        className="w-[75%] mb-2" 
                        disabled={loading || !isFormValid()} 
                    />
                </form>
                
                <div className="mt-4">
                    {isSignInPage ? "Don't have an account?" : "Already have an account?"} 
                    <span 
                        className="text-primary cursor-pointer underline ml-1" 
                        onClick={() => navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)}
                    >
                        {isSignInPage ? 'Sign up' : 'Sign in'}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Form