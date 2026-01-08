import { createContext, useContext, useState } from "react";

const AgentContext = createContext(null);

export const AgentProvider = ({ children }) => {
  const [activeBusiness, setActiveBusiness] = useState(null);

  return (
    <AgentContext.Provider
      value={{
        activeBusiness,
        setActiveBusiness,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error("useAgentContext must be used within AgentProvider");
  }
  return ctx;
};
