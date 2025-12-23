import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../components/Login/Login';
import { getUserData } from '../controller/user/user';
import { getAssignCompanyData } from '../controller/company/company';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      getUserData(dispatch).then(()=>{
        getAssignCompanyData().then(()=>{
          router.push('/home')
        }).catch((error)=>{
          console.error("Error getting Company Data",error);
        })
      }).catch((error)=>{
        console.error(error);
      });
    }
  }, [isAuthenticated, router]);

  return <Login />;
} 