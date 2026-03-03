import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";

import AuthContainer from "../../layouts/AuthContainer";
import { forgotPass, reset } from "../../features/auth/authSlice";

const index = () => {
  const toastRef = useRef(null);
  const [data, setData] = useState({
    email: "",
  });

  const dispatch = useDispatch();

  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isError && message) {
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 3000,
      });
    }

    if (isSuccess && message) {
      toastRef.current.show({
        severity: "success",
        summary: "Success",
        detail: message,
        life: 3000,
      });
      setData({
        email: "",
      });
    }

    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  const handleOnChange = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const { email } = data;
    dispatch(forgotPass(email));
  };

  return (
    <AuthContainer toast={toastRef}>
      <div className="card">
        <div className="text-center mb-5">
          <h2 className="text-3xl font-bold">Forgot Password?</h2>
          <p className="text-xl font-semibold">
            Enter your registered email address to reset
          </p>
        </div>
        <form onSubmit={onSubmit} className="p-fluid">
          <div className="field">
            <IconField iconPosition="left" className="p-float-label">
              <InputIcon className="pi pi-envelope"> </InputIcon>
              <InputText
                name="email"
                value={data.email}
                autoComplete="off"
                onChange={handleOnChange}
              />
              <label htmlFor="email">Email *</label>
            </IconField>
          </div>

          <div className="field">
            <Button
              className="custom-btn"
              type="submit"
              label="Reset"
              loading={isLoading}
              pt={{
                root: {
                  className: "bg-[#cc5500]",
                },
              }}
            />
          </div>
          <div className="">
            <span className="">
              Remember password?{" "}
              <Link
                to="/login"
                className="underline text-blue-500 hover:text-blue-800"
              >
                Sign-in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </AuthContainer>
  );
};

export default index;
