import React, { createContext, useContext, useState } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <AdminContext.Provider value={{ isAdminLoggedIn, setIsAdminLoggedIn }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}