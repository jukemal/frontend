import React, { useState, useEffect } from "react";
import {
  Grid,
  LinearProgress,
  Button,
  Modal,
  Fade,
  Backdrop,
  Typography,
  Card,
  CardHeader,
  Avatar,
  CardContent,
  MenuItem,
  ButtonGroup,
  Box
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Pages } from "@material-ui/icons";
import { purple, deepOrange } from "@material-ui/core/colors";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import { TextField } from "formik-material-ui";
import * as Yup from "yup";
import { DatePicker } from "@material-ui/pickers";
import moment from "moment";

import { fetchDataIfNeeded } from "../../actions";

// components
import PageTitle from "../../components/PageTitle";
import Report from "./Report";

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    position: "absolute",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4, 3),
    minWidth: "300px",
    maxWidth: "900px"
  },
  model: {
    top: "50%",
    left: "50%",
    transform: "translate(-50}%, -50%)"
  },
  button: {
    margin: theme.spacing(1)
  },
  card: {
    width: "350px",
    minWidth: "350px",
    margin: "auto"
  }
}));

export default function Payments() {
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateValues, setUpdateValues] = useState({
    id_: "",
    payment_methods_name: "",
    amount: "",
    payment_types_name: "",
    date_added: "",
    due_date: ""
  });
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);

  const dispatch = useDispatch();

  const selectedMenuItem = useSelector(state => state.selectedMenuItem);

  useEffect(() => {
    selectedMenuItem !== "payments" &&
      dispatch({ type: "SELECT_MENU_ITEM", menuItem: "payments" });
  }, [selectedMenuItem, dispatch]);

  dispatch(fetchDataIfNeeded("payments"));

  const isLoading = useSelector(
    state => state.dataPerMenuItem.payments.isFetching
  );

  var data = useSelector(state => state.dataPerMenuItem.payments.content.data);

  var notificationData=[]

  if (!isLoading) {
    var dataTableData = [];
    var count = 0;

    data.map(item => {
      var temp = [];

      temp[0] = item.id_;
      temp[1] = item.payment_methods_name;
      temp[2] = item.amount;
      temp[3] = item.payment_types_name;
      temp[4] = moment(item.date).format("YYYY-MM-DD");
      temp[5] = moment(item.due_date).format("YYYY-MM-DD");

      count++;

      dataTableData.push(temp);

      var a = moment(item.due_date);
      var b=moment(new Date())

      if (a.diff(b, "days") < 30 && notificationData.find((i)=>{
          return i.id_===item.id_
      })===undefined) {
        notificationData.push(item);
      }
    });
  }

  const columns = [
    {
      name: "ID",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Payment Method",
      options: {
        filter: true,
        sort: true
      }
    },
    {
      name: "Amount",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Payment Type",
      options: {
        filter: true,
        sort: true
      }
    },
    {
      name: "Date",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Due Date",
      options: {
        filter: false,
        sort: true
      }
    },
    {
      name: "Edit",
      options: {
        filter: false,
        sort: false,
        empty: true,
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <>
              <ButtonGroup>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    axios({
                      method: "delete",
                      url: `/payments/${tableMeta.rowData[0]}`
                    })
                      .then(response => {
                        console.log(response);
                        if (response.status === 200) {
                          dispatch({
                            type: "INVALIDATE_MENU_ITEM",
                            menuItem: "payments"
                          });
                          dispatch(fetchDataIfNeeded("payments"));
                        }
                      })
                      .catch(error => {
                        console.log(error);
                      });
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    console.log("tableMata", tableMeta.rowData);

                    const val = {
                      id_: tableMeta.rowData[0],
                      payment_methods_name: tableMeta.rowData[3],
                      amount: tableMeta.rowData[2],
                      payment_types_name: tableMeta.rowData[1],
                      date_added: tableMeta.rowData[4],
                      due_date: tableMeta.rowData[5]
                    };

                    setUpdateValues(val);

                    console.log("values", updateValues);

                    setOpenUpdate(true);
                  }}
                >
                  Edit
                </Button>
              </ButtonGroup>
            </>
          );
        }
      }
    }
  ];

  return (
    <>
      <PageTitle title="Payments" />
      <Grid container spacing={4}>
        {!isLoading && (
          <Grid item xs={12}>
            {notificationData.map(i => (
              <Box
                key={i.id_}
                style={{
                  margin: "5px 0",
                  backgroundColor: "#ffd740",
                  padding: "10px",
                  borderRadius: "10px"
                }}
              >
                <Grid container item xs={12}>
                  <Grid item xs={11}>
                    <Typography
                      align="center"
                      color="textSecondary"
                      variant="h5"
                      display="block"
                    >
                      {`Payment ${i.id_} has less than month till Due Date`}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography
                      align="right"
                      color="textSecondary"
                      display="block"
                      variant="h5"
                      style={{
                        margin: "0px 10px",
                        padding: "3px"
                      }}
                    >
                      X
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Grid>
        )}
        {!isLoading && (
          <Grid item xs={12}>
            <Card
              className={classes.card}
              style={{ backgroundColor: "#4fc3f7", borderRadius: "10px" }}
            >
              <CardHeader
                title="Total Payment Count"
                titleTypographyProps={{
                  align: "center",
                  variant: "h2"
                }}
                style={{
                  color: "white"
                }}
                avatar={
                  <Avatar
                    style={{
                      margin: 10,
                      color: "#fff",
                      backgroundColor: "#76ff03"
                    }}
                  >
                    <Pages />
                  </Avatar>
                }
              ></CardHeader>
              <CardContent
                style={{
                  textAlign: "center"
                }}
              >
                <Typography
                  variant="h1"
                  component="span"
                  style={{
                    color: "white",
                    backgroundColor: "#4db6ac",
                    padding: "10px",
                    borderRadius: "10px"
                  }}
                >
                  {count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12}>
          {!isLoading && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
            >
              Add
            </Button>
          )}
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            <LinearProgress />
          ) : (
            <MUIDataTable
              title="Payments"
              data={dataTableData}
              columns={columns}
              options={{
                filterType: "checkbox"
              }}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {!isLoading && (
            <>
              <Card raised={true}>
                <CardHeader
                  title="Payment Due Date"
                  titleTypographyProps={{
                    align: "center",
                    variant: "h2"
                  }}
                />
                <CardContent>
                  <Report />
                </CardContent>
              </Card>
            </>
          )}
        </Grid>
      </Grid>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 200 }}
      >
        <Fade in={open}>
          <div style={modalStyle} className={classes.paper}>
            <Formik
              initialValues={{
                payment_methods_name: "",
                amount: "",
                payment_types_name: "",
                date_added: new Date(),
                due_date: new Date()
              }}
              validationSchema={() => {
                return Yup.object({
                  amount: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .required("Required"),
                  date_added: Yup.date()
                    .min("2000/01/01")
                    .required("Required"),
                  due_date: Yup.date()
                    .min("2000/01/01")
                    .required("Required"),
                  payment_methods_name: Yup.mixed().required(
                    "Please select value"
                  ),
                  payment_types_name: Yup.mixed().required(
                    "Please select value"
                  )
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "post",
                  url: `/payments/`,
                  data: {
                    payment_methods: values.payment_methods_name,
                    amount: values.amount,
                    payment_types: values.payment_types_name,
                    date: moment(values.date_added).format("YYYY/MM/DD"),
                    due_date: moment(values.due_date).format("YYYY/MM/DD")
                  }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpenUpdate(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "payments"
                      });
                      dispatch(fetchDataIfNeeded("payments"));
                    }
                  })
                  .catch(error => {
                    console.log(error);
                  });
              }}
              render={({ submitForm, isSubmitting }) => (
                <div>
                  <Typography
                    align="center"
                    color="textPrimary"
                    display="block"
                    gutterBottom={true}
                    variant="h1"
                  >
                    Update Payment
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Amount"
                          name="amount"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="payment_methods_name"
                          label="Payment Method"
                          select
                          variant="standard"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          <MenuItem key="1" value="Cash Payment">
                            Cash Payment
                          </MenuItem>
                          <MenuItem key="2" value="Cheque">
                            Cheque
                          </MenuItem>
                          <MenuItem key="3" value="Credit Card">
                            Credit Card
                          </MenuItem>
                          <MenuItem key="4" value="Paypal">
                            Paypal
                          </MenuItem>
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="payment_types_name"
                          label="Payment Type"
                          select
                          variant="standard"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          <MenuItem key="11" value="Bill Payment">
                            Bill Payment
                          </MenuItem>
                          <MenuItem key="21" value="Invoice Payment">
                            Invoice Payment
                          </MenuItem>
                          <MenuItem key="31" value="Distributor Payment">
                            Distributor Payment
                          </MenuItem>
                        </Field>
                      </Grid>
                      <Grid item sm={6}>
                        <Field
                          label="Date Added"
                          name="date_added"
                          fullWidth
                          component={({ field, form, ...other }) => {
                            return (
                              <DatePicker
                                clearable
                                name={field.name}
                                value={field.value}
                                openTo="year"
                                format="YYYY/MM/DD"
                                views={["year", "month", "date"]}
                                onChange={date =>
                                  form.setFieldValue(field.name, date, true)
                                }
                                {...other}
                              />
                            );
                          }}
                        />
                      </Grid>
                      <Grid item sm={6}>
                        <Field
                          label="Due Date"
                          name="due_date"
                          fullWidth
                          component={({ field, form, ...other }) => {
                            return (
                              <DatePicker
                                clearable
                                name={field.name}
                                value={field.value}
                                openTo="year"
                                format="YYYY/MM/DD"
                                views={["year", "month", "date"]}
                                onChange={date =>
                                  form.setFieldValue(field.name, date._d, true)
                                }
                                {...other}
                              />
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        {isSubmitting && <LinearProgress />}
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={isSubmitting}
                          onClick={submitForm}
                          className={classes.button}
                        >
                          Submit
                        </Button>
                        <Button
                          color="primary"
                          className={classes.button}
                          disabled={isSubmitting}
                          onClick={() => setOpen(false)}
                        >
                          Cancle
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                </div>
              )}
            />
          </div>
        </Fade>
      </Modal>
      <Modal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 200 }}
      >
        <Fade in={openUpdate}>
          <div style={modalStyle} className={classes.paper}>
            <Formik
              initialValues={{
                id_: updateValues.id_,
                payment_methods_name: updateValues.payment_methods_name,
                amount: updateValues.amount,
                payment_types_name: updateValues.payment_types_name,
                date_added: updateValues.date_added,
                due_date: updateValues.due_date
              }}
              validationSchema={() => {
                return Yup.object({
                  id_: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .integer("Should be a integer.")
                    .required("Required"),
                  amount: Yup.number()
                    .min(1, "Must be a number greater than one")
                    .max(1000000, "Too big. Enter smaller value.")
                    .positive("Should be a positive number.")
                    .required("Required"),
                  date_added: Yup.date()
                    .min("2000/01/01")
                    .required("Required"),
                  due_date: Yup.date()
                    .min("2000/01/01")
                    .required("Required"),
                  payment_methods_name: Yup.mixed().required(
                    "Please select value"
                  ),
                  payment_types_name: Yup.mixed().required(
                    "Please select value"
                  )
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "put",
                  url: `/payments/${values.id_}`,
                  data: {
                    payment_methods: values.payment_methods_name,
                    amount: values.amount,
                    payment_types: values.payment_types_name,
                    date: moment(values.date_added).format("YYYY/MM/DD"),
                    due_date: moment(values.due_date).format("YYYY/MM/DD")
                  }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpenUpdate(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "payments"
                      });
                      dispatch(fetchDataIfNeeded("payments"));
                    }
                  })
                  .catch(error => {
                    console.log(error);
                  });
              }}
              render={({ submitForm, isSubmitting }) => (
                <div>
                  <Typography
                    align="center"
                    color="textPrimary"
                    display="block"
                    gutterBottom={true}
                    variant="h1"
                  >
                    Update Payment
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="ID"
                          name="id_"
                          component={TextField}
                          fullWidth
                          spacing={20}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="number"
                          label="Amount"
                          name="amount"
                          component={TextField}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="payment_methods_name"
                          label="Payment Method"
                          select
                          variant="standard"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          <MenuItem key="1" value="Cash Payment">
                            Cash Payment
                          </MenuItem>
                          <MenuItem key="2" value="Cheque">
                            Cheque
                          </MenuItem>
                          <MenuItem key="3" value="Credit Card">
                            Credit Card
                          </MenuItem>
                          <MenuItem key="4" value="Paypal">
                            Paypal
                          </MenuItem>
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          name="payment_types_name"
                          label="Payment Type"
                          select
                          variant="standard"
                          margin="normal"
                          fullWidth
                          component={TextField}
                        >
                          <MenuItem key="11" value="Bill Payment">
                            Bill Payment
                          </MenuItem>
                          <MenuItem key="21" value="Invoice Payment">
                            Invoice Payment
                          </MenuItem>
                          <MenuItem key="31" value="Distributor Payment">
                            Distributor Payment
                          </MenuItem>
                        </Field>
                      </Grid>
                      <Grid item sm={6}>
                        <Field
                          label="Date Added"
                          name="date_added"
                          fullWidth
                          component={({ field, form, ...other }) => {
                            return (
                              <DatePicker
                                clearable
                                name={field.name}
                                value={field.value}
                                openTo="year"
                                format="YYYY/MM/DD"
                                views={["year", "month", "date"]}
                                onChange={date =>
                                  form.setFieldValue(field.name, date, true)
                                }
                                {...other}
                              />
                            );
                          }}
                        />
                      </Grid>
                      <Grid item sm={6}>
                        <Field
                          label="Due Date"
                          name="due_date"
                          fullWidth
                          component={({ field, form, ...other }) => {
                            return (
                              <DatePicker
                                clearable
                                name={field.name}
                                value={field.value}
                                openTo="year"
                                format="YYYY/MM/DD"
                                views={["year", "month", "date"]}
                                onChange={date =>
                                  form.setFieldValue(field.name, date._d, true)
                                }
                                {...other}
                              />
                            );
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        {isSubmitting && <LinearProgress />}
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={isSubmitting}
                          onClick={submitForm}
                          className={classes.button}
                        >
                          Submit
                        </Button>
                        <Button
                          color="primary"
                          className={classes.button}
                          disabled={isSubmitting}
                          onClick={() => setOpenUpdate(false)}
                        >
                          Cancle
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                </div>
              )}
            />
          </div>
        </Fade>
      </Modal>
    </>
  );
}
