import { googleLogin } from "@/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const GoogleAuth: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');
        if (token) {
            dispatch(googleLogin(token))
                .unwrap()
                .then((user) => {
                    if (user.completenessScore < 100) {
                        navigate('/profile-completion', {
                            state: { completenessScore: user.completenessScore }
                        })
                    } else {
                        navigate('/feed')
                    }
                })
                .catch((err) => {
                    console.error("Google login failed", err);
                    toast.error("Login failed. Please try again.");
                    navigate("/login");
                })
        }
    }, [location.search])
    return (<></>)
}

export default GoogleAuth;