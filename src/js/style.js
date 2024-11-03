import Styled from 'styled-components';

const SearchBoxStyle = Styled.div`
    position: relative;
    height: 38px;
    min-width: 175px;
    padding: 0;
    display: flex;
    align-items: center;
    background-color: var(--templatiq-white-color);
    border-radius: 8px;
    button {
        display: flex;
        position: absolute;
        inset-inline-start: 16px;
        top: 10px;
        padding: 0;
        background: transparent;
    }
    input[type="text"] {
        width: 100%;
        height: 100%;
        border: none;
        padding: 0 42px;
        background: transparent;
        box-shadow: var(--templatiq-box-shadow);
        outline: none;
        transition: box-shadow 0.3s ease;
        &::placeholder {
            color: var(--templatiq-placeholder-color);
        }
        &:focus {
            box-shadow: var(----templatiq-box-shadow-focus);
        }
    }
`;

const SingleSelectStyle = Styled.div`
    line-height: 1.25;
    &:not(last-child){
        margin-bottom: 10px;
    }
    input[type='radio']{
        display: none;
        &:checked {
            & + .templatiq-single-select__option{
                font-weight: 500;
                color: var(--templatiq-color-dark);
                &:before{
                    border: 5px solid var(--templatiq-color-primary);
                }
            }
        }
    }
    .templatiq-single-select__option{
        position: relative;
        border-radius: 10px;
        padding: 14px 15px 14px 45px;
        width: 100%;
        min-height: 18px;
        display: flex;
        align-items: center;
        max-width: 290px;
        background-color: var(--templatiq-color-bg-light);
        color: var(--templatiq-color-gray);
        font-size: 14px;
        &:before{
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            inset-inline-start: 24px;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 2px solid var(--templatiq-color-extra-light);
            z-index: 10;
            box-sizing: border-box;
        }
    }
`;

const MultiSelectStyle = Styled.div`
    &:not(last-child){
        margin-bottom: 10px;
    }
    input[type='checkbox']{
        display: none;
        &:checked {
            & + .templatiq-multi-select__option{
                svg{
                    display: block;
                }
                &:before{
                    border-color: var(--templatiq-color-primary);
                    background-color: var(--templatiq-color-primary);
                }
            }
        }
    }
    .templatiq-multi-select__option{
        position: relative;
        display: flex;
        align-items: center;
        border-radius: 10px;
        padding: 14px 15px 14px 45px;
        width: 100%;
        max-width: 290px;
        min-height: 18px;
        background-color: var(--templatiq-color-bg-light);
        font-size: 14px;
        &:before{
            position: absolute;
            inset-inline-start: 15px;
            width: 18px;
            height: 18px;
            border-radius: 5px;
            background-color: transparent;
            content: '';
            border: 2px solid var(--templatiq-color-extra-light);
            top: 50%;
            transform: translateY(-50%);
            box-sizing: border-box;
        }
        svg{
            position: absolute;
            width: 8px;
            height: 8px;
            inset-inline-start: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: none;
            path{
                fill: var(--templatiq-color-white);
            }
        }
    }
`;

const ModalAlertStyle = Styled.div`
    padding: 84px 0 0;
    .templatiq-modal-action{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 30px;
        background-color: var(--templatiq-color-bg-light);
        .templatiq-btn{
            margin: 0 5px;
        }
        &.templatiq-modal-filter-action{
            .templatiq-modal-action__cancel{
                background: transparent;
                border: 0 none;
                padding: 0;
                color: var(--templatiq-color-light-gray);
                &:hover{
                    color: var(--templatiq-color-dark);
                }
            }
        }
        &.templatiq-delete-alert-modal-action,
        &.templatiq-conversation-delete-action,
        &.templatiq-form-delete-alert-action,
        &.templatiq-response-delete-alert-action,
        &.templatiq-delete-tag-alert-action{
            justify-content: flex-end;
            .templatiq-btn{
                border-radius: 10px;
                min-height: 40px;
            }
        }
    }

    //filter modal
    .templatiq-modal-filter-inner{
        padding: 0 30px 30px;
        .templatiq-modal-filter__tags-label{
            font-size: 16px;
            font-weight: 600;
            color: var(--templatiq-color-dark);
            margin-bottom: 20px;
            display: block;
        }
        .templatiq-modal-filter__tags-list{
            margin: 0;
            padding: 0;
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            max-height: 170px;
            overflow-y: auto;
            overflow-x: hidden;
        }
        .templatiq-modal-filter__tags-item{
            flex: 0 0 50%;
            margin-bottom: 18px;
            .templatiq-checkbox{
                display: flex;
                gap: 12px;
                label{
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--templatiq-color-gray);
                }
            }
        }
        .templatiq-show-more{
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--templatiq-color-dark);
            margin-top: 0;
            text-decoration: underline;
            cursor: pointer;
            &--active{
                margin-top: 18px;
            }
        }
    }
    .templatiq-modal-action{}

    .templatiq-session-expired__content{
        margin-top: -84px;
        display: flex;
        align-items: center;
        flex-direction: column;
        padding: 50px;
        h2{
            margin: 30px 0 20px;
            font-size: 24px;
            font-weight: 500;
            color: var(--templatiq-color-dark);
        }
        p{
            margin: 0 0 50px;
        }
    }
`;

const TemplatePackStyle = Styled.div`
    &.templatiq__content__dashboard {
        display: flex;
        gap: 20px;
        flex-direction: column;
        position: relative;
    }
    .templatiq__content__tab {
        display: flex;
        gap: 16px;
        flex-direction: column;
        position: relative;
    }
    
    .templatiq__content__top {
        display: flex;
        gap: 24px;
        justify-content: space-between;
        .templatiq__content__top__filter__title {
            font-size: 16px;
            font-weight: 600;
            color: var(--templatiq-dark-color);
            margin: 0;
        }
        .templatiq__content__top__filter {
            display: flex;
            gap: 20px;
            align-items: center;
        }

        &.templatiq__content__top--cloud {
            position: absolute;
            top: -75px;
            left: 248px;
        }
    }

    .templatiq-pagination {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        margin-top: 32px;
        li {
            a {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                background: var(--templatiq-primary-transparent);
                color: var(--templatiq-primary-color);
                border-radius: 4px;
                box-shadow: none;
                transition: background 0.3s ease, color 0.3s ease;
                svg {
                    width: 10px;
                    height: 10px;
                    path {
                        fill: var(--templatiq-primary-color);
                    }
                }
            }
            &.selected,
            &:hover {
                a {
                    color: var(--templatiq-white-color);
                    background: var(--templatiq-primary-color);
                    svg path {
                        fill: var(--templatiq-white-color);
                    }
                }
            }
            &.break,
            &.disabled {
                opacity: 0.5;
                pointer-events: none;
            }
        }
    }
`;

const TemplatePackFilterStyle = Styled.div`
    .templatiq__content__top__filter__tablist {
        display: flex;
        gap: 4px;
        padding: 4px;
        border-radius: 8px;
        background-color: var(--templatiq-white-color);
        box-shadow: var(--templatiq-box-shadow);
    }
    .templatiq__content__top__filter__item {
        display: flex;
        &.active {
            .templatiq__content__top__filter__link {
                color: var(--templatiq-white-color);
                &:before {
                    left: 0;
                    width: 100%;
                    background: var(--templatiq-primary-color);
                }
            }
        }
    }
    .templatiq__content__top__filter__link {
        position: relative;
        padding: 7px 12px;
        border-radius: 8px;
        color: var(--templatiq-body-color);
        background: transparent;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
        text-transform: uppercase;
        transition: color 0.3s ease;
        .templatiq__content__top__filter__link__text {
            position: relative;
            display: flex;
            gap: 8px;
            align-items: center;
            z-index: 1;
        }
        &:before {
            content: '';
            width: 0;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;
            border-radius: 8px;
            background: transparent;
            transition: all 0.3s ease;
        }
        &:hover {
            color: var(--templatiq-primary-color);
        }
    }

`;

const AuthStyle = Styled.div`
    display: flex;
    padding: 100px 0;
    flex-direction: column;
    .templatiq__auth__title {
        font-size: 21px;
        line-height: 25px;
        font-weight: 600;
        margin: 0 0 40px;
        text-align: center;
        color: var(--templatiq-dark-color);
    }
    .templatiq__auth__btn {
        width: fit-content;
        margin: 0 auto;
    }
    .templatiq__auth__wrapper {
        width: 500px;
        margin: 0 auto;
        padding: 40px 32px;
        border-radius: 16px;
        background-color: var(--templatiq-white-color);
    }
    .templatiq__auth__info {
        display: flex;
        gap: 28px;
        margin: 0 0 18px;
        flex-direction: column;
    }
    .templatiq__auth__info__single {
        display: flex;
        gap: 8px;
        flex-direction: column;
        label {
            font-size: 15px;
            line-height: 24px;
            font-weight: 500;
            text-align: start;
            color: var(--templatiq-dark-color);
        }
        input {
            height: 46px;
            padding: 0 20px;
            border: none;
            box-shadow: none;
            border-radius: 8px;
            color: var(--templatiq-body-color);
            background: var(--templatiq-sec-color);
        }
    }
    .templatiq__auth__actions {
        display: flex;
        gap: 20px;
        text-align: center;
        flex-direction: column;
        .templatiq__auth__link {
            font-size: 14px;
            line-height: 22px;
            font-weight: 400;
            box-shadow: none;
        }
        .templatiq__auth__btn {
            height: 54px;
            text-align: center;
            justify-content: center;
        }
    }
    .templatiq__auth__actions__wrapper {
        display: flex;
        gap: 20px;
        margin: 0 0 20px;
        align-items: center;
        justify-content: space-between;
    }
    .templatiq__auth__remember {
        margin: 0;
        label {
            font-size: 14px;
            font-weight: 400;
            color: var(--templatiq-body-color);
            padding-inline-start: 26px;
        }
    }
    .templatiq__auth__forgot {
        .templatiq__auth__link {
            font-size: 14px;
            line-height: 22px;
            font-weight: 400;
            padding-bottom: 2px;
            color: var(--templatiq-body-color);
            border-bottom: 1px dashed var(--templatiq-body-color);
            transition: color 0.3s ease, border-color 0.3s ease;
            &:hover {
                color: var(--templatiq-primary-color);
                border-color: var(--templatiq-primary-color);
            }
        }
    }
    .templatiq__auth__desc {
        font-size: 14px;
        line-height: 22px;
        font-weight: 500;
        color: var(--templatiq-body-color);
        .templatiq__auth__link {
            padding-inline-start: 4px;
            color: var(--templatiq-primary-color);
        }
    }
    .templatiq__auth__btn_wrapper {
        display: flex;
        gap: 10px;
    }
    .notification-wrapper {
        text-align: center;
        .templatiq__auth__btn_wrapper {
            justify-content: center;
        }
    }
`;

export {
    AuthStyle, ModalAlertStyle, MultiSelectStyle, SearchBoxStyle,
    SingleSelectStyle, TemplatePackFilterStyle, TemplatePackStyle
};

