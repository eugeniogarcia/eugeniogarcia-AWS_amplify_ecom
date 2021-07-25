import React, { ReactChild} from 'react'
export default function Container({ children }: { children: (React.ReactChild[] | React.ReactChild)}) {
    return (
        <div style={containerStyle}>
            {children}
        </div>
    )
}
const containerStyle = {
    width: 900,
    margin: '0 auto',
    padding: '20px 0px'
}