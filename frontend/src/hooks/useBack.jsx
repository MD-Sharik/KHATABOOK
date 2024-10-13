import React from "react";
import { useNavigate } from "react-router-dom";
function useBack() {
  const navigate = useNavigate();
  const back = () => navigate(-1);
  return back;
}

export default useBack;
