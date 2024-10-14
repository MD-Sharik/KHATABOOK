import { useNavigate } from "react-router-dom";

function useLogout() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };
  return logout;
}

export default useLogout;
