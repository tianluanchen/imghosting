import { Typography, theme } from "antd";
const { Title } = Typography;
export default function Logo({ hideTitle }: { hideTitle: boolean }) {
    return (
        <div
            className="logo"
            style={{
                height: 64
            }}
        >
            <img referrerPolicy="no-referrer" src="./logo.jpg" alt="logo image" />
            {hideTitle ? null : (
                <Title level={1} style={{ color: theme.useToken().token.colorWhite }}>
                    IMG HOSTING
                </Title>
            )}
        </div>
    );
}
