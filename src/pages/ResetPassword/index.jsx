import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { IconField } from "primereact/iconfield";

import AuthContainer from "../../layouts/AuthContainer";
import { reset, resetPass } from "../../features/auth/authSlice";

const index = () => {
  const passwordValidation = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  const search = new URLSearchParams(useLocation().search);
  const toastRef = useRef(null);
  const [data, setData] = useState({
    secret: "",
    userId: "",
    password: "",
    password_confirmation: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, type, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    setData({
      ...data,
      secret: search.get("secret"),
      userId: search.get("userId"),
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

    if (isSuccess && message) {
      toastRef.current.show({
        severity: "success",
        summary: "Success",
        detail: message,
        life: 3000,
      });
      setData({
        secret: "",
        userId: "",
        password: "",
        password_confirmation: "",
      });
      toastRef.current.onHide(() => {
        if (type == "auth/reset-password/fulfilled") {
          dispatch(reset());
          navigate("/");
        }
      });
    }

    dispatch(reset());
  }, [isError, isSuccess, message, dispatch]);

  const handleOnChange = (event) => {
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPass(data));
  };

  return (
    <AuthContainer toast={toastRef}>
      <div className="card">
        <div className="mb-5 text-center">
          <h2 className="text-3xl font-bold my-0">Reset Password</h2>
        </div>
        <form onSubmit={onSubmit} className="p-fluid">
          <div className="field">
            <IconField iconPosition="left" className="p-float-label">
              {/* <InputIcon className="pi pi-lock z-10"></InputIcon> */}
              <Password
                name="password"
                value={data.password}
                toggleMask
                autoComplete="new password"
                className={
                  data.password && !passwordValidation.test(data.password)
                    ? "p-invalid"
                    : ""
                }
                onChange={handleOnChange}
                required
              />

              <label htmlFor="password">New Password *</label>
            </IconField>
            {data.password && !passwordValidation.test(data.password) && (
              <small id="password-help" className="p-error block">
                Must contain at least one of each sets A-Z, a-z, 0-9 and minimum
                of 8 characters.
              </small>
            )}
          </div>
          <div className="field">
            <IconField iconPosition="left" className="p-float-label">
              {/* <InputIcon className="pi pi-lock z-10"></InputIcon> */}
              <Password
                name="password_confirmation"
                value={data.password_confirmation}
                onChange={handleOnChange}
                toggleMask
                className={
                  data.password_confirmation &&
                  data.password !== data.password_confirmation
                    ? "p-invalid"
                    : ""
                }
                required
              />

              <label htmlFor="password_confirmation">
                Re-enter New Password
              </label>
            </IconField>
            {data.password_confirmation &&
              data.password !== data.password_confirmation && (
                <small id="password-help" className="p-error block">
                  Password do not match
                </small>
              )}
          </div>
          <div className="">
            <Button
              type="submit"
              label="Change Password"
              loading={isLoading}
              className="custom-btn "
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
