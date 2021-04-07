import { useState } from 'react';
import { Layout, Select, Menu, Button, Spin, Form } from 'antd';
import SubcultureTooltip from './components/SubcultureTooltip';
import { FirebaseDatabaseNode } from '@react-firebase/database';
import styled from 'styled-components';
import './App.css';
import { config } from './config';

const { Header, Content, Footer } = Layout;
const { Option } = Select;

const InnerContent = styled.div`
  flex: 1;
  display: flex;
  padding: 24px;
  background: #fff;
  margin-top: 32px;
`;

const FormWrapper = styled.div`
  max-width: 90px;

  @media screen and (min-width: 640px) {
    min-width: 150px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 640px) {
    flex-direction: row;
    min-width: 150px;
  }
`;

const Application = () => {
  const [flowerChosen, setFlowerChosen] = useState({});
  const [edibleChosen, setEdibleChosen] = useState({});
  const [showEdibleRecipe, setShowEdibleRecipe] = useState(false);
  const [showFlowerRecipe, setShowFlowerRecipe] = useState(false);
  const [edibleForm] = Form.useForm();
  const [flowerForm] = Form.useForm();

  const handleChange = e => {
    const arr = e.split('-');
    const type = arr[0];
    const obj = Object.assign(type === 'edible' ? edibleChosen : flowerChosen, {});
    obj[arr[1]] = arr[2];

    // spread to new object to trigger re-render https://stackoverflow.com/a/56266640
    if (type === 'edible') setEdibleChosen({ ...obj });
    else setFlowerChosen({ ...obj });
  };

  const getMenu = (type, prop, list) =>
    Object.keys(list).map(key => (
      <Option key={key} value={`${type}-${prop}-${key}`}>
        {list[key]}
      </Option>
    ));

  const getSelects = type => {
    const recipe = config.app.recipe;
    const props = type === 'edible' ? recipe.edibleProps : recipe.flowerProps;

    return props.map(prop => (
      <FirebaseDatabaseNode key={prop} path={`/${prop}`}>
        {d =>
          d.value ? (
            <Form.Item name={prop} rules={[{ required: true }]}>
              <Select placeholder={`${prop[0].toUpperCase()}${prop.slice(1)}`} onChange={handleChange}>
                {getMenu(type, prop, d.value)}
              </Select>
            </Form.Item>
          ) : (
            <div>
              <Spin />
            </div>
          )
        }
      </FirebaseDatabaseNode>
    ));
  };

  const handleSubmit = type => {
    if (type === 'edible') setShowEdibleRecipe(true);
    else setShowFlowerRecipe(true);
  };

  const handleReset = type => {
    if (type === 'edible') {
      edibleForm.resetFields();
      setShowEdibleRecipe(false);
      setEdibleChosen({});
    } else {
      flowerForm.resetFields();
      setShowFlowerRecipe(false);
      setFlowerChosen({});
    }
  };

  const getRecipeButton = recipeType => {
    const disabled =
      recipeType === 'edible' ? Object.keys(edibleChosen).length < 4 : Object.keys(flowerChosen).length < 2;
    const button = (
      <Button type='primary' disabled={disabled} onClick={() => handleSubmit(recipeType)}>
        Get Recipe
      </Button>
    );

    if (disabled) return <SubcultureTooltip title='Please make all selections'>{button}</SubcultureTooltip>;

    return button;
  };

  const getInnerContent = type => (
    <InnerContent>
      <FormWrapper>
        <h2>{`${type[0].toUpperCase()}${type.slice(1)}`}</h2>
        <Form form={type === 'edible' ? edibleForm : flowerForm}>
          {getSelects(type)}
          <ButtonWrapper>
            {getRecipeButton(type)}
            <Button type='link' onClick={() => handleReset(type)}>
              reset
            </Button>
          </ButtonWrapper>
        </Form>
      </FormWrapper>
      {((type === 'edible' && showEdibleRecipe) || (type === 'flower' && showFlowerRecipe)) && (
        <>
          <div style={{ flex: 1, marginLeft: '32px' }}>
            <h2>Ingredients</h2>
            <FirebaseDatabaseNode
              path={`/ingredients/${type === 'edible' ? edibleChosen.edibleType : flowerChosen.flowerType}`}>
              {d =>
                d.value ? (
                  <ol>
                    {d.value.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ol>
                ) : (
                  <Spin />
                )
              }
            </FirebaseDatabaseNode>
          </div>
          <div style={{ flex: 1, marginLeft: '32px' }}>
          <h2>Directions</h2>
            <FirebaseDatabaseNode
              path={`/directions/${type === 'edible' ? edibleChosen.edibleType : flowerChosen.flowerType}`}>
              {d =>
                d.value ? (
                  <ol>
                    {d.value.map((recipe, i) => (
                      <li key={i}>{recipe}</li>
                    ))}
                  </ol>
                ) : (
                  <Spin />
                )
              }
            </FirebaseDatabaseNode>
          </div>
        </>
      )}
    </InnerContent>
  );

  return (
    <Layout className='layout' style={{ height: '100%' }}>
      <Header>
        <Menu theme='dark' mode='horizontal' selectedKeys={['1']}>
          <Menu.Item key='1'>Recipes</Menu.Item>
          <Menu.Item key='2'>Orders</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ display: 'flex', flexDirection: 'column', padding: '0 48px' }}>
        {getInnerContent('edible')}
        {getInnerContent('flower')}
      </Content>
      <Footer>Subculture Labs ©2021</Footer>
    </Layout>
  );
};

export default Application;
