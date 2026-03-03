import { Toast } from "primereact/toast";
import Header from "../components/Header";

const AuthContainer = ({ children, toast }) => {
    return (
        <div className="bg-[#f8fafc] w-full flex flex-col grow h-screen">
            <Toast ref={toast} />
            <Header />

            <div className="grow flex flex-col items-center justify-center">
                <div className="w-full md:w-[35rem] bg-white shadow-md rounded-md p-3 sm:p-6 border border-slate-200">
                    {children}
                </div>
            </div>

            <div className="my-6 self-center">
                <small className="text-center text-stone-500 w-fit">
                    Copyright &copy;{new Date().getFullYear()}{" "}
                    {/* <a href="#">CCT LOGISTICS BACK END SYSTEM</a> */}
                </small>
            </div>
        </div>
    );
};

export default AuthContainer;
