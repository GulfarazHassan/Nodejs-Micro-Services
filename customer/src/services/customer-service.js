const { CustomerRepository } = require("../database");
const { FormateData, GeneratePassword, GenerateSalt, GenerateSignature, ValidatePassword } = require('../utils');
const { APIError, BadRequestError } = require('../utils/app-errors')


// All Business logic will be here
class CustomerService {

    constructor() {
        this.repository = new CustomerRepository();
    }

    async SignIn(userInputs) {

        const { email, password } = userInputs;

        try {

            const existingCustomer = await this.repository.FindCustomer({ email });

            if (existingCustomer) {

                const validPassword = await ValidatePassword(password, existingCustomer.password, existingCustomer.salt);

                if (validPassword) {
                    const token = await GenerateSignature({ email: existingCustomer.email, _id: existingCustomer._id });
                    return FormateData({ id: existingCustomer._id, token });
                }
            }

            return FormateData(null);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }


    }

    async SignUp(userInputs) {

        const { email, password, phone } = userInputs;

        try {
            // create salt
            let salt = await GenerateSalt();

            let userPassword = await GeneratePassword(password, salt);

            const existingCustomer = await this.repository.CreateCustomer({ email, password: userPassword, phone, salt });

            const token = await GenerateSignature({ email: email, _id: existingCustomer._id });

            return FormateData({ id: existingCustomer._id, token });

        } catch (err) {
            throw new APIError('Data Not found', err)
        }

    }

    async AddNewAddress(_id, userInputs) {

        const { street, postalCode, city, country } = userInputs;

        try {
            const addressResult = await this.repository.CreateAddress({ _id, street, postalCode, city, country })
            return FormateData(addressResult);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }


    }

    async GetProfile(id) {

        try {
            const existingCustomer = await this.repository.FindCustomerById({ id });
            return FormateData(existingCustomer);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async GetShopingDetails(id) {

        try {
            const existingCustomer = await this.repository.FindCustomerById({ id });

            if (existingCustomer) {
                return FormateData(existingCustomer);
            }
            return FormateData({ msg: 'Error' });

        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async GetWishList(customerId) {

        try {
            const wishListItems = await this.repository.Wishlist(customerId);
            return FormateData(wishListItems);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async AddToWishlist(customerId, product) {
        try {
            console.log("Add to wishh")
            const wishlistResult = await this.repository.AddWishlistItem(customerId, product);
            return FormateData(wishlistResult);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ManageCart(customerId, product, qty, isRemove) {
        try {
            const cartResult = await this.repository.AddCartItem(customerId, product, qty, isRemove);
            return FormateData(cartResult);
        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ManageOrder(customerId, order) {
        console.log("customerId :: ", customerId);
        console.log("order :: ", order);
        const orderResult = await this.repository.AddOrderToProfile(customerId, order);
        return FormateData(orderResult);
    }

    async SubscribeEvents(payload) {

        payload = JSON.parse(payload);

        const { event, data } = payload;
        console.log("payload :: ", payload)
        const { userId, product, order, qty } = data;
        switch (event) {
            case 'ADD_TO_WISHLIST':
            case 'REMOVE_FROM_WISHLIST':
                console.log("REMOVE_FROM_WISHLISTis called")
                console.log("userId called : ", userId)
                console.log("product called : ", product)
                this.AddToWishlist(userId, product)
                break;
            case 'ADD_TO_CART':
                console.log("ADD_TO_CART called")
                this.ManageCart(userId, product, qty, false);
                break;
            case 'REMOVE_FROM_CART':
                console.log("REMOVE_FROM_CART called")
                this.ManageCart(userId, product, qty, true);
                break;
            case 'CREATE_ORDER':
                console.log("CREATE_ORDER is called")
                console.log("Create order is called userId: ", userId)
                console.log("Create order is called : ", order)
                this.ManageOrder(userId, order);
                break;
            case 'TESTING':
                console.log("TESTING called")
                console.log("Testing event is working.")
                break;
            default:
                console.log("DEFAULT called")
                break;
        }
    }

}

module.exports = CustomerService;