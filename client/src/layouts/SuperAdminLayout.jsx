import React from 'react'
import SideBar from '../components/SideBar';
import ROLES from "../constants/roles";
import Header from '../components/Header';

const SuperAdminLayout = ({children}) => {
  return (
    <div className='super-admin-layout'>
        <Header/>
        <div className='super-admin-layout-body'>
            <SideBar role={ROLES.SUPER_ADMIN}/>
            <div className='main-content'>
                {children}
            </div>
        </div>
    </div>
  )
}

export default SuperAdminLayout
