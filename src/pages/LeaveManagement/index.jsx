import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import moment from "moment";

import MainContainer from "../../layouts/MainContainer";
import { getAllLeaveApplication } from "../../lib/appwrite";

const index = () => {
  const toastRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleGetLeaveApplication();
  }, []);

  const handleGetLeaveApplication = async () => {
    try {
      const res = await getAllLeaveApplication();
      setData(res.rows);
      setTotal(res.total);
      setIsLoading(false);
    } catch (error) {
      setError(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: error,
        life: 3000,
      });

      toastRef.current.onHide(() => setError(null));
    }
  }, [error]);

  const getSeverity = (status) => {
    switch (status) {
      case "rejected":
        return "danger";

      case "approved":
        return "success";

      case "pending":
        return "info";

      case "cancelled":
        return "warning";
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-1 items-center text-[#f8fafc]">
        <button
          onClick={(e) => navigate(`edit/${rowData.id}`)}
          className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center hover:bg-slate-400"
          title="Edit"
        >
          <i className="fa-solid fa-pencil text-sm"></i>
        </button>

        <button
          onClick={() => {
            if (
              window.confirm(`You are about to delete this user are you sure?`)
            ) {
            }
          }}
          className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500"
          title="Delete"
        >
          <i className="fa-solid fa-trash text-sm"></i>
        </button>
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
    );
  };

  const dateBodyTemplate = (date) => (
    <div className="">{moment(date).format("ll")}</div>
  );

  const userBodyTemplate = (rowData) => {
    const employee = rowData.representative;

    return (
      <div className="flex align-items-center gap-2">
        <Avatar
          label={`${employee?.name.split(" ")[0].charAt(0)}${employee?.name.split(" ")[1].charAt(0)}`}
          shape="circle"
          style={{ backgroundColor: "#6a008e", color: "#ffffff" }}
        />
        <span>{employee.name}</span>
      </div>
    );
  };

  return (
    <MainContainer toast={toastRef}>
      <div className="shadow-md rounded-lg p-2 bg-white border border-slate-200">
        <div className="w-full rounded">
          <DataTable
            value={data}
            paginator
            rows={20}
            totalRecords={total}
            loading={isLoading}
            breakpoint="0px"
            tableStyle={{ minWidth: "50rem" }}
            dataKey="id"
            stripedRows
            header={header}
          >
            <Column field="id" header="ID"></Column>
            <Column
              field="name"
              header="Employee Name"
              body={userBodyTemplate}
            ></Column>
            <Column
              field="leaveType"
              header="Leave Type"
              align="center"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="startDate"
              header="Start Date"
              align="center"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="leaveType"
              header="Leave Type"
              align="center"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="status"
              header="Status"
              body={statusBodyTemplate}
            ></Column>
            <Column
              field="reason"
              header="Reason"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="approverId"
              header="Approve By"
              align="center"
              style={{ minWidth: "10rem" }}
              body={userBodyTemplate}
            ></Column>
            <Column
              field="comment"
              header="Comment"
              style={{ minWidth: "10rem" }}
            ></Column>
            <Column
              field="approvalDate"
              header="Approve At"
              align="center"
              style={{ minWidth: "10rem" }}
              body={(row) => dateBodyTemplate(row.approvalDate)}
            ></Column>
            <Column
              field="createdAt"
              header="Submitted At"
              style={{ minWidth: "10rem" }}
              body={(row) => dateBodyTemplate(row.createdAt)}
            ></Column>
            <Column header="Action" body={actionBodyTemplate}></Column>
          </DataTable>
        </div>
      </div>
    </MainContainer>
  );
};

export default index;
