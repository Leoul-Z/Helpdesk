function canTransition(role, from, to){
    switch (role){
        case 'EMPLOYEE':
            if((from=='RESOLVED') && (to=='CLOSED')){
                return true;
            }else{
                return false
            }
        case 'MANAGER':
            if((from=='OPEN') && (to=='ASSIGNED')){
                return true;
            }else{
                return false
            }
        case 'TECHNICAL':
            if((from=='ASSIGNED') && (to=='IN_PROGRESS') || (from=='IN_PROGRESS') && (to=='RESOLVED')){
                return true;
            }else{
                return false
            }
    }
}

module.exports= canTransition;