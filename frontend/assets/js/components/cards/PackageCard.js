import _ from 'lodash'
import React from "react"
import PropTypes from 'prop-types'
import {Card, Button, Grid, Icon, Modal, Message} from "semantic-ui-react"
import ModalPackageCard from "./ModalPackageCard"
//TODO achar um jeito mais inteligente de pegar as extensões permitidas por kernel

const extensionsByKernel = {
  "Linux": ["deb","rpm","sh"],
  "Windows": ["exe"],
  "OSX": ["app"],
};

export default class PackageCard extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            modalOpen: false
        }
        this.getHandleOpen = this.getHandleOpen.bind(this)
        this.getHandleClose = this.getHandleClose.bind(this)
    }

    reduceKernelPlatforms(packages) {
        let platforms = [];
        if (packages !== undefined) {
            platforms = _.reduce(packages, (platform, bpackage) => {
                const platform_kernel = _.map(bpackage.platforms, (platform_param) => platform_param.kernel);
                return platform.concat(platform_kernel);
            }, []);
        }
        return (_.uniq(platforms));
    }

    getIcon(platform_icon){
        if (platform_icon==='OSX') {
            platform_icon = 'apple'
        }
        return platform_icon.toLowerCase()
    }

    getHandleOpen(){
        this.setState({modalOpen: true})
    }

    getHandleClose(){
        this.setState({modalOpen: false})
    }

    getLicensePlatformModal(value,index){
        const messageLicense = "Ao realizar o download do instalador do jogo. O(A) senhor(a) concorda que a plataforma de jogos da Universidade de Brasília (UnB games), e a Universidade de Brasília não responsabiliza-se por possíveis danos em seu computador nem mal funcionamento dos jogos baixados."
        return (
            <Modal open={this.state.modalOpen} onClose={this.getHandleClose}
                    trigger={
                        <Button basic color='green' onClick={this.getHandleOpen}>
                            <Icon name={this.getIcon(value)} />
                        </Button>
                    }
            >
                <Modal.Header>Termo de uso <Icon color='yellow' name='warning sign'/></Modal.Header>
                <Modal.Content>
                   <Message info>
                        <p>{messageLicense}</p>
                    </Message>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={this.getHandleClose}>
                        <Icon name='remove' />Não aceitar
                    </Button>
                        {this.getPackagesModal(value,index)}
                </Modal.Actions>
            </Modal>
        )
    }

    getPackagesModal(value,index){
        const game_pk = this.props.game_pk

        return (
                <ModalPackageCard key={index}
                    button={
                        <Button color='green'>
                            <Icon name='checkmark' />Aceitar
                        </Button>}
                    platform={this.handlePackages(value)}
                    game_pk={game_pk}
                    kernel={value}
                    gameName={this.props.gameName}
                    downloads={this.props.downloads}
                />
        )
    }

    getButtonsPlatforms(){
        const buttons_platforms = (this.reduceKernelPlatforms(this.props.packages)).map((value,index)=>
            this.getLicensePlatformModal(value,index)
        )
        if (buttons_platforms.length > 0) {
            return buttons_platforms;
        } else {
            return <Button basic color='red'>Não há pacotes cadastrados</Button>
        }
    }

    getPlatforms(packageExtension,platforms){
        var filteredPlatforms = _.filter(platforms,(platform) => {
            return platform.extensions == packageExtension
        })

       return filteredPlatforms
    }

    getPackageExtension(packagePath){
        var index = packagePath.lastIndexOf('.')
        var packageExtension = packagePath.slice(index + 1)

        return packageExtension
    }

    packageIsRelatedToKernel(kernel,packageExtension){
        var isRelated = _.includes(extensionsByKernel[kernel], packageExtension)

        return isRelated
    }

    handlePackages(kernel){
        const packages = this.props.packages
        var packagesByKernel = {}
        var plat = []

        if(packages !== undefined){
            packages.forEach((eachPackage) => {
                var packageExtension = this.getPackageExtension(eachPackage['package'])
                if(this.packageIsRelatedToKernel(kernel,packageExtension)){
                    packagesByKernel[eachPackage] = []
                    packagesByKernel[eachPackage].push(kernel)

                    plat = this.getPlatforms(packageExtension,eachPackage.platforms)
                }
            })
        }

        return plat
    }

    render () {

        return (
            <Card fluid>
                <Card.Content header="Download"/>
                <Card.Content>
                    <Grid centered size='large'>
                        <Button.Group>
                            {this.getButtonsPlatforms()}
                        </Button.Group>
                    </Grid>
                </Card.Content>
                <Card.Content extra/>
            </Card>
        );
    }
}

PackageCard.propTypes = {
    downloads: PropTypes.number.isRelated,
    game_pk: PropTypes.number.isRequired,
    packages: PropTypes.array.isRequired,
    gameName: PropTypes.string.isRequired
}
