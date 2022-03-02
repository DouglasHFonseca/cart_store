import React from 'react';
import {Link} from 'react-router-dom';
import {MdShoppingBasket} from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import * as S from './styles';
import {useCart} from '../../hooks/useCart';

const Header = (): JSX.Element => {
    const {cart} = useCart();
    let cartSize = cart.length

    return (
        <S.Container>
            <Link to="/">
                <img src={logo} alt="Rocketshoes"/>
            </Link>

            <S.Cart to="/cart">
                <div>
                    <strong>Meu carrinho</strong>
                    <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`}
          </span>
                </div>
                <MdShoppingBasket size={36} color="#FFF"/>
            </S.Cart>
        </S.Container>
    );
};

export default Header;
