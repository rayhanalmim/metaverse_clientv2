import { getI18n } from 'react-i18next';

const Demo = () => {
    const { t } = getI18n();

    return (
        <div> { t('demo') } </div>
    )
}

export default Demo;
