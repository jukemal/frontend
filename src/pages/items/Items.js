import React, { useState, useEffect } from "react";
import { Grid, LinearProgress, Modal, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import { TextField } from "formik-material-ui";

// components
import PageTitle from "../../components/PageTitle";

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
		width: 800,
		height: 600,
		backgroundColor: theme.palette.background.paper,
		border: "2px solid #000",
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3)
	}
}));

const columns = [
	{
		name: "Item Code",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Name",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Retail Price",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Quantity",
		options: {
			filter: false,
			sort: true
		}
	},
	{
		name: "Wholesale Price",
		options: {
			filter: false,
			sort: true
		}
	}
];

const dataTableData = [];

export default function Items() {
	const [isLoading, setIsLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [modalStyle] = useState(getModalStyle);
	const classes = useStyles();

	useEffect(() => {
		axios
			.get("/items/")
			.then(res => {
				res.data.map(item => {
					var temp = [];

					temp[0] = item.item_code;
					temp[1] = item.name;
					temp[2] = item.retail_price;
					temp[3] = item.qty;
					temp[4] = item.wholesale_price;

					dataTableData.push(temp);
				});
				setIsLoading(false);
			})
			.catch(err => console.log(err));
	},[isLoading]);

	return (
		<>
			<PageTitle title="Items" />
			<Grid container spacing={4}>
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
						/>
					)}
				</Grid>
			</Grid>
			<Modal open={open} onClose={() => setOpen(false)}>
				<div style={modalStyle} className={classes.paper}>
					<Formik
						initialValues={{
							item_code: "",
							name: "",
							retail_price: "",
							qty: "",
							wholesale_price: ""
						}}
						validate={values => {
                            const errors: Partial<Values> = {};
                            if (!values.item_code) {
                                errors.item_code = 'Required';
                            }
                            if (!values.name) {
                                errors.name = 'Required';
                            }
                            if (!values.retail_price) {
                                errors.retail_price = 'Required';
                            }
                            if (!values.qty) {
                                errors.qty = 'Required';
                            }
                            if (!values.wholesale_price) {
                                errors.wholesale_price = 'Required';
                            }
                            return errors;
                        }}
						onSubmit={(values, { setSubmitting }) => {
							alert(JSON.stringify(values, null, 2));
							setSubmitting(false);
                            setIsLoading(true);
                            axios({
                                method:"post",
                                url:"/items/",
                                data:{
                                    item_code:values.item_code,
                                    name:values.name,
                                    qty:values.qty,
                                    retail_price:values.retail_price,
                                    wholesale_price:values.wholesale_price,
                                    mfd_date:"2020-04-20T00:00:00",
                                    exp_date:"2020-04-20T00:00:00"
                                },
                                headers: {'content-type': 'application/json'}
                            })
                            .then(function (response) {
                                console.log(response);
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                            setIsLoading(false);
						}}
						render={({ submitForm, isSubmitting }) => (
							<div>
								<h3>Add Item</h3>
								<Form>
									<br />
									<Field
										type="number"
										label="Item Code"
										name="item_code"
										component={TextField}
										fullWidth
										spacing={20}
									/>
									<br />
									<Field
										type="text"
										label="Name"
										name="name"
										component={TextField}
										fullWidth
									/>
									<br />
									<Field
										type="number"
										label="Retail Price"
										name="retail_price"
										component={TextField}
										fullWidth
									/>
									<br />
									<Field
										type="number"
										label="Quantity"
										name="qty"
										component={TextField}
										fullWidth
									/>
									<br />
									<Field
										type="number"
										label="Wholesale Price"
										name="wholesale_price"
										component={TextField}
										fullWidth
									/>
									<br />
									{isSubmitting && <LinearProgress />}
									<br />
									<Button
										variant="contained"
										color="primary"
										disabled={isSubmitting}
										onClick={submitForm}
									>
										Submit
									</Button>
								</Form>
							</div>
						)}
					/>
				</div>
			</Modal>
		</>
	);
}
