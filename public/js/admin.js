const deleteProduct = (btn, productId, csrf) => {
    // const productId = btn.parentNode.querySelector('[name=productId]').value;
    // const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    // send request to server
    console.log("incoming csrf token:", csrf);
    console.log("incoming product id:", productId);
    const productElement = btn.closest('article');
    fetch('/admin/product/' + productId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf, // include the CSRF token in the headers
            'Content-Type': 'application/json'
        }
    })
    .then(result => {
        // return new promise with response body
        return result.json();
    })
    .then(data => {
        console.log(data);
        // remove product from the dom - it was removed from the SB in the server side
        const grid = productElement.parentNode;
        grid.removeChild(productElement);
    })
    .catch(err => {
        console.log(err);
    });

}