import Header from "../../components/Header";

const index = () => {
    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="bg-image flex-1">
                <div className="bg-black opacity-75 h-full flex items-center">
                    <div className="flex-1 flex flex-col justify-center px-5 md:px-8">
                        <div className="mb-6">
                            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
                                Transform Your Career
                            </h1>
                        </div>
                        <div className="mb-10">
                            <p className="max-w-2xl mx-auto text-xl text-white mb-4">
                                Practical, hands-on tech training that equips
                                you with the skills and confidence to land
                                high-paying roles you’ll love.
                            </p>
                            <p className="max-w-2xl mx-auto text-xl text-white ">
                                Top 20 Black-Owned Business in the UK by
                                Channel4 and Lloyds Bank. Featured in Forbes
                                Africa.
                            </p>
                        </div>
                    </div>
                    <div className="flex-1"></div>
                </div>
            </div>
        </div>
    );
};

export default index;
