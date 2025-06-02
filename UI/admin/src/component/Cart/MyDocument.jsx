import React from 'react';
import PropTypes from 'prop-types';
import { Image, Text, View, Page, Document, StyleSheet } from '@react-pdf/renderer';
import logo from '../Asset/img/Screenshot 2025-03-31 083355-Photoroom.png';
import { Font } from '@react-pdf/renderer';

const MyDocument = ({ data }) => {
    const { totalPrice, products } = data;

    const styles = StyleSheet.create({

        page: {
            fontSize: 11,
            paddingTop: 30,
            paddingHorizontal: 40,
            lineHeight: 1.5,
            backgroundColor: '#fefefe',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        logo: {
            width: 60,
            height: 60,
        },
        invoiceTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'right',
            color: '#222',
        },
        userInfo: {
            marginBottom: 20,
        },
        label: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#333',
        },
        value: {
            fontSize: 12,
            color: '#555',
            marginBottom: 4,
        },
        tableHeader: {
            flexDirection: 'row',
            backgroundColor: '#f0f0f0',
            borderBottom: '1 solid #ccc',
            paddingVertical: 5,
            paddingHorizontal: 5,
        },
        tableRow: {
            flexDirection: 'row',
            borderBottom: '1 solid #eee',
            paddingVertical: 5,
            paddingHorizontal: 5,
        },
        cellHeader: {
            flex: 1,
            fontSize: 11,
            fontWeight: 'bold',
            color: '#333',
        },
        cell: {
            flex: 1,
            fontSize: 10,
            color: '#444',
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 10,
            borderTop: '1 solid #ccc',
            paddingTop: 8,
        },
        totalLabel: {
            fontSize: 12,
            fontWeight: 'bold',
            marginRight: 10,
        },
        totalValue: {
            fontSize: 12,
            color: '#000',
        },

    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Image style={styles.logo} src={logo} />
                    <Text style={styles.invoiceTitle}>MHP Store</Text>
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{localStorage.getItem('globalEmailCart')}</Text>
                    <Text style={styles.label}>Total Price:</Text>
                    <Text style={styles.value}>{totalPrice}VND</Text>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.cellHeader, { flex: 2 }]}>Item</Text>
                    <Text style={styles.cellHeader}>Price</Text>
                    <Text style={styles.cellHeader}>Qty</Text>
                    <Text style={styles.cellHeader}>Amount</Text>
                </View>

                {/* Table Body */}
                {products.map(product => (
                    <View style={styles.tableRow} key={product.productId}>
                        <Text style={[styles.cell, { flex: 2 }]}>{product.productName}</Text>
                        <Text style={styles.cell}>{product.price}VND</Text>
                        <Text style={styles.cell}>{product.quantity}</Text>
                        <Text style={styles.cell}>{(product.price * product.quantity)}VND</Text>
                    </View>
                ))}

                {/* Total */}
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>{totalPrice}VND</Text>
                </View>
            </Page>
        </Document>
    );
};
MyDocument.propTypes = {
    data: PropTypes.shape({
        totalPrice: PropTypes.number.isRequired,
        products: PropTypes.arrayOf(
            PropTypes.shape({
                productId: PropTypes.string.isRequired,
                productName: PropTypes.string.isRequired,
                price: PropTypes.number.isRequired,
                quantity: PropTypes.number.isRequired,
            })
        ).isRequired,
    }).isRequired,
};

export default MyDocument;
