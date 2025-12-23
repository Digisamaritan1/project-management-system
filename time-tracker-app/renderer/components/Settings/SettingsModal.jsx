import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Loader from '../Loader/Loader';
import { setCurrentCompany } from '../../store/companySlice';
import store from '../../store/store';
import { setCompanyRulesToStore } from '../../controller/company/company';

const SettingsModal = ({onLogout}) => {
  const router = useRouter();
  const companies = useSelector((state)=> state.company.assignCompany)
  const currentCompany = useSelector((state)=> state.company.currentCompany)
  const [selectedCompany,setSelectedCompany] = useState(currentCompany?.id)
  const [isLoading,setIsLoading] = useState(false);
  const isInterNetLost = useSelector((state)=> state.auth.isInternetLost);
  
async function changeCompany(e) {
    try {
        if (isInterNetLost) {
            return;
        }
        
        setIsLoading(true);
        setSelectedCompany(e.target.value);
        let company = companies.find((x)=> x.id === e.target.value)
        
        await store.dispatch(setCurrentCompany(company));
        await setCompanyRulesToStore()
        localStorage.setItem("companyId",company.id);   
        setIsLoading(false);
    } catch (error) {
        setIsLoading(false);
        console.error(error);
    }

  }
  return (
    <div className="w-full">
        {isLoading && <Loader/>}
      <div className="p-2">
        {/* Dropdown */}
        <div className='text-red-400 mt-2.5'>{isInterNetLost ? 'Internet Connection Lost' : ''}</div>
        <div className="relative">
          <select value={selectedCompany} onChange={(e)=> changeCompany(e)} className="w-full px-3 py-2 text-[14px] text-[#374151] bg-white border border-[#D1D5DB] rounded appearance-none cursor-pointer focus:outline-none focus:border-[#2F3990]">
            {companies.length > 0 && companies.map((item, index) => {
                return (
                    <option value={item.id} key={index}>{item.Cst_CompanyName}</option>
                )
            })}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-2 space-y-1">
          {/* <button 
            className="w-full flex items-center px-3 py-2 text-[14px] text-[#374151] hover:bg-gray-100 rounded"
          >
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </button> */}
          
          <button 
            className="w-full flex items-center px-3 py-2 text-[14px] text-[#374151] hover:bg-gray-100 rounded"
            onClick={onLogout}
          >
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 