function validarCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
}

function validarUF(uf) {
    const ufLimpa = uf.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(ufLimpa);
}

function validarNumero(numero) {
    return numero.trim().length > 0;
}
