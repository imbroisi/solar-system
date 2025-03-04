import skyImg from './Sky-2.webp';

const Sky = () => {
  return (
    <div style={{ 
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '-280px',
      // right: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <img 
        src={skyImg} 
        alt="sky" 
        style={{ 
          width: '150vw' 
        }} 
      />
    </div>
  );
};

export default Sky;
