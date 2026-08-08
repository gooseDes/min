import { isTauri } from "@/utils";
import { useNavigate } from "react-router-dom";

export type NavigateFunctionMin = (to: string) => Promise<void>;

function useNavigateMin(): NavigateFunctionMin {
    const routerNavigate = useNavigate();

    const navigate: NavigateFunctionMin = async (to: string) => {
        await routerNavigate(to, { viewTransition: isTauri() ? false : true });
    };

    return navigate;
}

export default useNavigateMin;
