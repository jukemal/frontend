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
  ButtonGroup
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
import PageTitle from "../../components/PageTitle/PageTitle";

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

export default function Items() {
 const [open, setOpen] = useState(false);
 const [openUpdate, setOpenUpdate] = useState(false);
 const [updateValues, setUpdateValues] = useState({
   id_: "",
   name: ""
 });
 const classes = useStyles();
 const [modalStyle] = useState(getModalStyle);
 const dispatch = useDispatch();

 const selectedMenuItem = useSelector(state => state.selectedMenuItem);

 useEffect(() => {
   selectedMenuItem !== "items" &&
     dispatch({ type: "SELECT_MENU_ITEM", menuItem: "items" });
 }, [selectedMenuItem, dispatch]);

 dispatch(fetchDataIfNeeded("items"));

 const isLoading = useSelector(state => state.dataPerMenuItem.items.isFetching);

 var data = useSelector(state => state.dataPerMenuItem.items.content);

 if (!isLoading) {
   var dataTableData = [];
   var count = 0;

   data.map(item => {
     var temp = [];

     temp[0] = item.id_;
     temp[1] = item.name

     count++;

     dataTableData.push(temp);
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
     name: "Name",
     options: {
       filter: true,
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
                     url: `/items/${tableMeta.rowData[0]}`
                   })
                     .then(response => {
                       console.log(response);
                       if (response.status === 200) {
                         dispatch({
                           type: "INVALIDATE_MENU_ITEM",
                           menuItem: "items"
                         });
                         dispatch(fetchDataIfNeeded("items"));
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
                     cashier: tableMeta.rowData[1]
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
      <PageTitle title="Items" />
      <Grid container spacing={4}>
        {!isLoading && (
          <Grid
            container
            item
            xs={12}
            spacing={1}
            alignContent="space-around"
            alignItems="center"
            justify="center"
          >
            <>
              <Grid item xs={12}>
                <Card
                  className={classes.card}
                  style={{ backgroundColor: "#4fc3f7", borderRadius: "10px" }}
                >
                  <CardHeader
                    title="Total Item Count"
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
            </>
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
              title="Items"
              data={dataTableData}
              columns={columns}
              options={{
                filterType: "checkbox"
              }}
              style={{
                minWidth: "500px"
              }}
            />
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
                id: "",
                name: ""
              }}
              validationSchema={() => {
                return Yup.object({
                  name: Yup.string()
                    .max(100, "Must be 100 characters or less")
                    .trim()
                    .lowercase()
                    .required("Required")
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "post",
                  url: "/items/",
                  data: {
                    name: values.name
                  },
                  headers: { "content-type": "application/json" }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpen(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "items"
                      });
                      dispatch(fetchDataIfNeeded("items"));
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
                    Add Item
                  </Typography>
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Name"
                          name="name"
                          component={TextField}
                          fullWidth
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
        <Fade in={open}>
          <div style={modalStyle} className={classes.paper}>
            <Formik
              initialValues={{
                id: updateValues.id_,
                name: updateValues.name
              }}
              validationSchema={() => {
                return Yup.object({
                  name: Yup.string()
                    .max(100, "Must be 100 characters or less")
                    .trim()
                    .lowercase()
                    .required("Required")
                });
              }}
              onSubmit={(values, { setSubmitting }) => {
                console.log(values);
                axios({
                  method: "put",
                  url: `/items/${values.id_}`,
                  data: {
                    name: values.name
                  },
                  headers: { "content-type": "application/json" }
                })
                  .then(response => {
                    console.log(response);
                    if (response.status === 200) {
                      setSubmitting(false);
                      setOpen(false);
                      dispatch({
                        type: "INVALIDATE_MENU_ITEM",
                        menuItem: "items"
                      });
                      dispatch(fetchDataIfNeeded("items"));
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
                    Update Item
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
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          type="text"
                          label="Name"
                          name="name"
                          component={TextField}
                          fullWidth
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
