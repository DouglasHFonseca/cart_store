import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {Product} from '../types';
import {toast} from 'react-toastify'
import {api} from "../services/api";

interface CartProviderProps {
    children: ReactNode;
}

interface UpdateProductAmount {
    productId: number;
    amount: number;
}

interface CartContextData {
    cart: Product[];
    addProduct: (productId: number) => Promise<void>;
    removeProduct: (productId: number) => void;
    updateProductAmount: ({productId, amount}: UpdateProductAmount) => void;
    decrementProduct: (productId: number) => Promise<void>;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({children}: CartProviderProps): JSX.Element {
    const [cart, setCart] = useState<Product[]>(() => {
        const storageCart = localStorage.getItem('@RocketShoes:cart');
        if (storageCart) {
            return JSON.parse(storageCart);
        }

        return [];
    });

    useEffect(() => {
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    }, [cart])

    const addProduct = async (productId: number) => {
        try {
            const product = await api
                .get(`/stock/${productId}`).then(({data}) => data);
            product && product.amount <= 0 && toast.error('Quantidade solicitada fora de estoque')
            const findProduct = cart.find((e) => e.id === productId);
            if (!!findProduct) {
                await updateProductAmount({productId, amount: 1})
            } else {
                await api.put(`/stock/${productId}`, {amount: product.amount - 1})
                const productInfo = await api.get(`/products/${productId}`).then(({data}) => data)
                setCart([...cart, {...productInfo, amount: 1}])
            }
        } catch (e) {
            toast.error('Erro na adição do produto')
        }
    };

    const decrementProduct  = async (productId: number)=>{
        try{
            const product = await api
                .get(`/stock/${productId}`).then(({data}) => data);
            await api.put(`/stock/${productId}`, {amount: product.amount + 1})
            const productIndex = cart.findIndex((product) => product.id === productId);
            const tempCart = [...cart];
            tempCart[productIndex].amount += -1;
            setCart(tempCart)
        }catch (e) {
            toast.error('Erro na adição do produto')
        }
    }

    const removeProduct = async (productId: number) => {
        try {
            const product = cart.find((e) => e.id === productId)
            const productInfo = await api.get(`/stock/${productId}`).then(({data}) => data)
            if (product && productInfo) {
                await api.put(`/stock/${productId}`, {amount: product.amount + product.amount})
            }
            const item = cart.filter(el => el.id !== productId)
            setCart([...item])
        } catch(e) {
            toast.error('Erro na remoção do produto');
        }
    };

    const updateProductAmount = async ({
                                           productId,
                                           amount,
                                       }: UpdateProductAmount) => {
        try {
            if (amount <= 0) return
            const product = await api
                .get(`/stock/${productId}`).then(({data}) => data);
            if (!!product && product.amount < amount) {
                toast.error('Quantidade solicitada fora de estoque')
            } else {
                const productIndex = cart.findIndex((product) => product.id === productId);
                const tempCart = [...cart];
                tempCart[productIndex].amount += amount;
                await api.put(`/stock/${productId}`, {amount: product.amount - 1})
                setCart(tempCart)
            }
        } catch {
            toast.error('Erro na alteração de quantidade do produto');
        }
    };

    return (
        <CartContext.Provider
            value={{cart, addProduct, removeProduct, updateProductAmount, decrementProduct}}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart(): CartContextData {
    return useContext(CartContext);
}
