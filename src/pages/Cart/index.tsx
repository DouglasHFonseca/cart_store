import React from 'react';
import {
    MdDelete,
    MdAddCircleOutline,
    MdRemoveCircleOutline,
} from 'react-icons/md';

import {useCart} from '../../hooks/useCart';
import {formatPrice} from '../../util/format';
import {Container, ProductTable, Total} from './styles';
import {toast} from "react-toastify";

interface Product {
    id: number;
    title: string;
    price: number;
    image: string;
    amount: number;
}

const Cart = (): JSX.Element => {
    const {cart, removeProduct, updateProductAmount, addProduct, decrementProduct} = useCart();
    const cartFormatted = cart.map((product) => ({
        ...product,
        priceFormatted: formatPrice(product.price),
        subTotal: formatPrice(product.amount * product.price)

    }))
    const total =
        formatPrice(
            cart.reduce((sumTotal, product) => {
                return sumTotal + (product.price * product.amount)
            }, 0)
        )

    async function handleProductIncrement(product: Product) {
        try {
            await updateProductAmount({productId: product.id, amount: 1})

        } catch {
            toast.error('Erro no incremento do produto');
        }
    }

    async function handleProductDecrement(product: Product) {
        try {
            await decrementProduct(product.id)

        } catch {
            toast.error('Erro no descremento do produto');
        }
    }

    function handleRemoveProduct(productId: number) {
        return removeProduct(productId)
    }

    return (
        <Container>
            <ProductTable>
                <thead>
                <tr>
                    <th aria-label="product image"/>
                    <th>PRODUTO</th>
                    <th>QTD</th>
                    <th>SUBTOTAL</th>
                    <th aria-label="delete icon"/>
                </tr>
                </thead>
                <tbody>
                {cartFormatted.map((product) =>
                    <tr data-testid="product" key={product.id}>
                        <td>
                            <img src={product.image}
                                 alt={product.title}/>
                        </td>
                        <td>
                            <strong>{product.title}</strong>
                            <span>{product.priceFormatted}</span>
                        </td>
                        <td>
                            <div>
                                <button
                                    type="button"
                                    data-testid="decrement-product"
                                    disabled={product.amount <= 1}
                                    onClick={() => handleProductDecrement(product)}
                                >
                                    <MdRemoveCircleOutline size={20}/>
                                </button>
                                <input
                                    type="text"
                                    data-testid="product-amount"
                                    readOnly
                                    value={product.amount}
                                />
                                <button
                                    type="button"
                                    data-testid="increment-product"
                                    onClick={() => handleProductIncrement(product)}
                                >
                                    <MdAddCircleOutline size={20}/>
                                </button>
                            </div>
                        </td>
                        <td>
                            <strong>{formatPrice(product.price * product.amount)}</strong>
                        </td>
                        <td>
                            <button
                                type="button"
                                data-testid="remove-product"
                                onClick={() => handleRemoveProduct(product.id)}
                            >
                                <MdDelete size={20}/>
                            </button>
                        </td>
                    </tr>
                )}
                </tbody>
            </ProductTable>

            <footer>
                <button type="button">Finalizar pedido</button>

                <Total>
                    <span>TOTAL</span>
                    <strong>{total}</strong>
                </Total>
            </footer>
        </Container>
    );
};

export default Cart;
