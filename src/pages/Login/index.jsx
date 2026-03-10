import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";

import { login, reset } from "../../features/auth/authSlice";
import AuthContainer from "../../layouts/AuthContainer";

const index = () => {
  const toastRef = useRef(null);
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const { email, password, remember } = data;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, type, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    setData({
      email: localStorage.getItem("user_email") || "",
      password: localStorage.getItem("user_pass") || "",
    });
  }, []);

  useEffect(() => {
    if (isError && message) {
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 3000,
      });
    }

    dispatch(reset());
  }, [isError, isSuccess, message, navigate, dispatch]);

  const handleOnChange = (event) => {
    setData({
      ...data,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (remember) {
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_pass", password);
    }
    dispatch(login(data));
  };
  return (
    <AuthContainer toast={toastRef}>
      <div className="card ">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold my-0">Login</h2>
          <p className="text-xl font-semibold">Sign In to your account</p>
        </div>
        <form onSubmit={onSubmit} className="p-fluid">
          <div className="field">
            <IconField iconPosition="left" className="p-float-label">
              <InputIcon className="pi pi-envelope"> </InputIcon>
              <InputText
                name="email"
                value={email}
                autoComplete="off"
                onChange={handleOnChange}
              />
              <label htmlFor="email">Email *</label>
            </IconField>
          </div>
          <div className="field">
            <IconField iconPosition="left" className="p-float-label">
              {/* <InputIcon className="pi pi-lock z-10"></InputIcon> */}
              <Password
                name="password"
                toggleMask
                value={password}
                autoComplete="off"
                feedback={false}
                onChange={handleOnChange}
              />

              <label htmlFor="password">Password *</label>
            </IconField>
          </div>
          <div className="field flex items-center justify-between">
            <div className="field-checked text-gray-900 items-center">
              <Checkbox
                id="remember"
                name="remember"
                value={remember}
                onChange={handleOnChange}
                checked={data.remember}
                className="mr-2"
              />

              <label htmlFor="accept" className="">
                Remember me
              </label>
            </div>
            <Link
              to="/password/forgot"
              className="underline text-sm text-blue-500 hover:text-blue-800"
            >
              Forgotten password?
            </Link>
          </div>
          <div className="">
            <Button
              type="submit"
              label="Login"
              loading={isLoading}
              pt={{
                root: {
                  className: "bg-[#cc5500]",
                },
              }}
            />
          </div>
        </form>
      </div>
    </AuthContainer>
  );
};

export default index;
